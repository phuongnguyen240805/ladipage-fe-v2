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
 * Returns true if the environment is allowed to fallback to mock database data.
 * This is only allowed in development when NEXT_PUBLIC_ENABLE_MOCK_FALLBACK is true.
 */
export function shouldFallbackToMock(): boolean {
  const isDev = process.env.NODE_ENV !== "production";
  const enableFallback = process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK === "true";
  return isDev && enableFallback;
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
export async function resolveOrgAndProject(supabase: any, userId: string | null) {
  let orgId = "org-1";
  let projectId: string | null = null;

  // 1. Resolve Organization ID from organization_members
  if (userId && supabase) {
    const { data: member, error: memberErr } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
      
    if (member && !memberErr) {
      orgId = member.organization_id;
    }
  }

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
