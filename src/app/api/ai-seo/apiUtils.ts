import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Generates a deterministic UUID version 5 for a virtual website project
 * based on the organization ID.
 */
export function getVirtualProjectId(orgId: string): string {
  const hash = crypto.createHash("sha1").update(`builder:${orgId}`).digest("hex");
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    `5${hash.substring(13, 16)}`,
    `8${hash.substring(17, 20)}`,
    hash.substring(20, 32)
  ].join("-");
}

/**
 * Compatibility hook retained for existing route code.
 * This build is real-data-only: API/database failures never fall back to fixtures.
 */
export function shouldFallbackToMock(): boolean {
  return false;
}

/**
 * Standardized database/internal error handler for production-safe APIs.
 */
export function jsonError(error: any, message: string, status = 500) {
  console.error(`API Error: ${message}`, error);
  return NextResponse.json(
    {
      error: "DATABASE_ERROR",
      message,
      details: error?.message || String(error || "Unknown error details")
    },
    { status }
  );
}

/**
 * Resolves the organization_id and project_id for a given user.
 * If no projects exist under the organization, it automatically creates a default project.
 */
export async function resolveOrgAndProject(
  supabase: any,
  userId: string | null,
): Promise<{ orgId: string; projectId: string | null }> {
  let projectId: string | null = null;

  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isSupabaseUserId = typeof userId === "string" && UUID_PATTERN.test(userId);

  if (!isSupabaseUserId || !supabase) {
    throw new Error("Cannot resolve organization without an authenticated Supabase user.");
  }

  const { data: member, error: memberErr } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (memberErr || !member?.organization_id) {
    throw new Error("User is not a member of any organization.");
  }

  const orgId: string = member.organization_id;

  // 2. Resolve or create Project ID under the organization
  if (supabase) {
    const { data: proj, error: projErr } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", orgId)
      .limit(1)
      .maybeSingle();

    if (proj && !projErr) {
      projectId = proj.id;
    } else {
      // Create a default project context
      const { data: newProj, error: createProjErr } = await supabase
        .from("projects")
        .insert({
          organization_id: orgId,
          name: "Dự án mặc định"
        })
        .select("id")
        .single();

      if (newProj && !createProjErr) {
        projectId = newProj.id;
      } else {
        console.warn("Failed to create default project context:", createProjErr);
      }
    }
  }

  return { orgId, projectId };
}
