import { NextRequest } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";
import { decodeJwt } from "jose";
import { SESSION_COOKIE_NAME } from "@/features/auth/constants";
import { isJwtExpired } from "@/features/auth/utils/jwt-decode";
import { resolveSupabaseUrl } from "@/lib/supabase-admin";

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

function extractBearerToken(request: NextRequest): string | null {
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
  user: ResolvedPlatformUser
): boolean {
  if (!page.user_id) return true;
  if (user.source === "supabase") return page.user_id === user.id;
  return false;
}