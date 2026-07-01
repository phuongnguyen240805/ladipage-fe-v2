import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { getSupabaseAdmin, getSupabaseServiceRoleKey } from "@/lib/supabase-admin";
import {
  canEditLandingPage,
  resolvePlatformUser,
} from "@/lib/platform-auth.server";

export { getSupabaseAdmin };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface BuilderSessionPayload {
  pageId: string;
  userId: string;
  exp: number;
}

export function isValidBuilderPageId(pageId: unknown): pageId is string {
  return typeof pageId === "string" && UUID_PATTERN.test(pageId);
}

export function jsonError(message: string, status = 400) {
  return { error: message, status };
}

export async function getAuthenticatedUser(request: NextRequest) {
  const resolved = await resolvePlatformUser(request);
  if (!resolved) return null;
  if (resolved.supabaseUser) return resolved.supabaseUser;
  return { id: resolved.id } as { id: string };
}

function getSessionSecret() {
  return (
    process.env.BUILDER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    getSupabaseServiceRoleKey() ||
    ""
  );
}

function encodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

export function createBuilderSessionToken(pageId: string, userId: string) {
  if (!getSessionSecret()) throw new Error("Builder session secret is missing.");
  const exp = Date.now() + 15 * 60 * 1000;
  const encodedPayload = encodeJson({ pageId, userId, exp } satisfies BuilderSessionPayload);
  return {
    token: `${encodedPayload}.${signPayload(encodedPayload)}`,
    expiresAt: new Date(exp).toISOString(),
  };
}

export function verifyBuilderSessionToken(token: string, expectedPageId?: string) {
  if (!getSessionSecret()) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = signPayload(encodedPayload);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as BuilderSessionPayload;
    if (!isValidBuilderPageId(payload.pageId) || !payload.userId || Date.now() > payload.exp) return null;
    if (expectedPageId && payload.pageId !== expectedPageId) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function assertCanEditLandingPage(request: NextRequest, pageId: string) {
  if (!isValidBuilderPageId(pageId)) {
    return { error: jsonError("Invalid landing page id.", 400) };
  }

  const user = await resolvePlatformUser(request);
  if (!user) {
    return { error: jsonError("Unauthorized. Sign in before opening the builder.", 401) };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { error: jsonError("Supabase server configuration is missing.", 500) };
  }

  const { data: page, error } = await supabase
    .from("landing_pages")
    .select("id, user_id")
    .eq("id", pageId)
    .maybeSingle();

  if (error) return { error: jsonError(error.message, 500) };
  if (page && !canEditLandingPage(page, user)) {
    return { error: jsonError("Forbidden. You do not own this page.", 403) };
  }

  return { user: { id: user.id }, supabase };
}

export function getBuilderSessionFromHeader(request: NextRequest, pageId?: string) {
  const token = request.headers.get("x-builder-session")?.trim();
  if (!token) return null;
  return verifyBuilderSessionToken(token, pageId);
}
