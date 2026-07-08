import { NextRequest } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";
import { decodeJwt } from "jose";
import { SESSION_COOKIE_NAME } from "@/features/auth/constants";
import { isJwtExpired } from "@/features/auth/utils/jwt-decode";
import { resolveSupabaseUrl } from "@/lib/supabase-admin";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSupabaseUserId(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

export type ResolvedPlatformUser = {
  id: string;
  source: "supabase" | "nest";
  supabaseUser?: User;
  nestUid?: number;
};

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

function resolveNestUser(token: string): ResolvedPlatformUser | null {
  if (isJwtExpired(token)) return null;
  try {
    const payload = decodeJwt(token);
    const uid =
      typeof payload.uid === "number"
        ? payload.uid
        : typeof payload.sub === "number"
          ? payload.sub
          : typeof payload.uid === "string"
            ? Number(payload.uid)
            : typeof payload.sub === "string" && /^\d+$/.test(payload.sub)
              ? Number(payload.sub)
              : null;
    if (!uid || Number.isNaN(uid)) return null;
    return { id: String(uid), source: "nest", nestUid: uid };
  } catch {
    return null;
  }
}

export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.slice(7).trim();
    if (jwt) return jwt;
  }
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function resolvePlatformUser(
  request: NextRequest
): Promise<ResolvedPlatformUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const userClient = getSupabaseWithUserJwt(token);
  if (userClient) {
    const { data, error } = await userClient.auth.getUser();
    if (!error && data?.user) {
      return {
        id: data.user.id,
        source: "supabase",
        supabaseUser: data.user,
      };
    }
  }

  return resolveNestUser(token);
}

export function canEditLandingPage(
  page: { user_id?: string | null },
  user: ResolvedPlatformUser,
  linkedSupabaseUserId?: string | null,
): boolean {
  if (!page.user_id) return false;
  if (user.source === "supabase") return page.user_id === user.id;
  if (linkedSupabaseUserId) return page.user_id === linkedSupabaseUserId;
  return false;
}

/** Nest sys_user.supabase_user_id — used when session is Nest JWT but page owner is Supabase UUID. */
export async function fetchNestLinkedSupabaseUserId(
  bearerToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/account/profile`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const body = (await response.json()) as {
      data?: { supabaseUserId?: string | null; supabase_user_id?: string | null };
      supabaseUserId?: string | null;
      supabase_user_id?: string | null;
    };
    const profile = body.data ?? body;
    const linked = profile.supabaseUserId ?? profile.supabase_user_id ?? null;
    return isSupabaseUserId(linked) ? linked : null;
  } catch {
    return null;
  }
}

/** Supabase UUID for landing_pages ownership filters and edit checks. */
export async function resolveLandingPageOwnerSupabaseId(
  request: NextRequest,
  resolved?: ResolvedPlatformUser | null,
): Promise<string | null> {
  const user = resolved ?? (await resolvePlatformUser(request));
  if (!user) return null;
  if (user.source === "supabase") return user.id;

  const token = extractBearerToken(request);
  if (!token || user.source !== "nest") return null;
  return fetchNestLinkedSupabaseUserId(token);
}