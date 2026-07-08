import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "./_auth";
import { resolvePlatformUser } from "@/lib/platform-auth.server";

export function jsonAuthError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Require signed-in user with a Supabase UUID for landing data isolation. */
export async function requireLandingPageOwner(request: NextRequest) {
  const platformUser = await resolvePlatformUser(request);
  if (!platformUser) {
    return { error: jsonAuthError("Unauthorized. Sign in required.", 401) as NextResponse };
  }

  const owner = await getAuthenticatedUser(request);
  if (!owner?.id) {
    return {
      error: jsonAuthError(
        "Account is not linked to Supabase. Link your account before managing landing pages.",
        403,
      ) as NextResponse,
    };
  }

  return { ownerId: owner.id, platformUser };
}

export function assertRecordOwnedBy(
  record: { user_id?: string | null } | null | undefined,
  ownerId: string,
  label = "resource",
): NextResponse | null {
  if (!record) return null;
  if (!record.user_id || record.user_id !== ownerId) {
    return jsonAuthError(`Forbidden. You do not own this ${label}.`, 403);
  }
  return null;
}

export function assertPageOwnedBy(
  page: { user_id?: string | null } | null | undefined,
  ownerId: string,
): NextResponse | null {
  return assertRecordOwnedBy(page, ownerId, "page");
}