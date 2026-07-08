import { NextRequest } from "next/server";
import {
  isSupabaseUserId,
  resolveLandingPageOwnerSupabaseId,
} from "@/lib/platform-auth.server";

export { isSupabaseUserId };

/**
 * Landing tables store user_id as auth.users UUID.
 * Nest JWT users resolve linked supabase_user_id via Nest profile when available.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const ownerId = await resolveLandingPageOwnerSupabaseId(request);
  if (ownerId) return { id: ownerId };
  return null;
}