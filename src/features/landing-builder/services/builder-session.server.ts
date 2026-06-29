import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url || url.startsWith("http")) return url;
  if (!url.startsWith("eyJ")) return url;
  try {
    const [, payload] = url.split(".");
    if (!payload) return url;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { ref?: string };
    return decoded.ref ? `https://${decoded.ref}.supabase.co` : url;
  } catch {
    return url;
  }
}

export function getSupabaseAdmin() {
  const url = resolveSupabaseUrl();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !url.startsWith("http") || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getSupabaseWithUserJwt(jwt: string) {
  const url = resolveSupabaseUrl();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !url.startsWith("http") || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const jwt = authHeader.slice(7).trim();
  if (!jwt) return null;

  const userClient = getSupabaseWithUserJwt(jwt);
  if (!userClient) return null;

  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

function getSessionSecret() {
  return (
    process.env.BUILDER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
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

  const user = await getAuthenticatedUser(request);
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
  if (!page) return { error: jsonError("Landing page not found.", 404) };
  if (page.user_id && page.user_id !== user.id) {
    return { error: jsonError("Forbidden. You do not own this page.", 403) };
  }

  return { user, supabase };
}

export function getBuilderSessionFromHeader(request: NextRequest, pageId?: string) {
  const token = request.headers.get("x-builder-session")?.trim();
  if (!token) return null;
  return verifyBuilderSessionToken(token, pageId);
}
