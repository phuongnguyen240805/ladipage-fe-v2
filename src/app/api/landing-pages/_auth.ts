import { NextRequest } from "next/server";
import { resolvePlatformUser } from "@/lib/platform-auth.server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSupabaseUserId(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

/**
 * Landing tables store user_id as auth.users UUID.
 * Nest JWT uid (e.g. "19") is not a valid Supabase user id — return null in that case.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const resolved = await resolvePlatformUser(request);
  if (!resolved) return null;
  if (resolved.supabaseUser) return resolved.supabaseUser;
  if (isSupabaseUserId(resolved.id)) return { id: resolved.id };
  return null;
}