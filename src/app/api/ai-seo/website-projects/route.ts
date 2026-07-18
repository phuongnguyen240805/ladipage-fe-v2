import { NextRequest, NextResponse } from "next/server";

import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";

import { mockDb } from "../mockDb";
import { getVirtualProjectId, resolveOrgAndProject, shouldFallbackToMock, jsonError } from "../apiUtils";

export const runtime = "nodejs";

async function resolveOrgId(
  request: NextRequest,
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  ownerId: string,
): Promise<string> {
  const headerOrg = request.headers.get("x-org-id");
  if (headerOrg && headerOrg !== "org-1") {
    return headerOrg;
  }

  try {
    const { orgId } = await resolveOrgAndProject(supabase, ownerId);
    return orgId ?? headerOrg ?? "org-1";
  } catch {
    return headerOrg || "org-1";
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireLandingPageOwner(request);
    if ("error" in auth) {
      return auth.error;
    }

    const fallbackEnabled = shouldFallbackToMock();
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getWebsiteProjects("org-1"));
      }
      return jsonError(
        new Error(getSupabaseAdminConfigError() ?? "Supabase admin missing"),
        "Supabase not configured",
      );
    }

    const orgId = await resolveOrgId(request, supabase, auth.ownerId);
    const projs: Array<Record<string, unknown>> = [];

    try {
      const { data, error } = await supabase
        .from("website_projects")
        .select("*")
        .eq("organization_id", orgId);

      if (error) {
        if (!fallbackEnabled) {
          return jsonError(error, "Failed to retrieve website projects");
        }
      } else if (data) {
        projs.push(...data);
      }
    } catch (error) {
      if (!fallbackEnabled) {
        return jsonError(error, "Failed to retrieve website projects");
      }
    }

    const { count, error: lpCountError } = await supabase
      .from("landing_pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.ownerId);

    if (lpCountError && !fallbackEnabled) {
      return jsonError(lpCountError, "Failed to check landing pages");
    }

    if ((count ?? 0) > 0) {
      const virtualProjId = getVirtualProjectId(orgId);
      const hasVirtualProj = projs.some((project) => project.id === virtualProjId);
      if (!hasVirtualProj) {
        projs.push({
          id: virtualProjId,
          organization_id: orgId,
          project_id: "default-project",
          name: "Landing Page Builder (Hệ thống)",
          domain: "builder-pages.local",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (projs.length === 0) {
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getWebsiteProjects(orgId));
      }
    }

    return NextResponse.json(projs);
  } catch (err: unknown) {
    console.error("GET website-projects error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json(mockDb.getWebsiteProjects("org-1"));
    }
    return jsonError(err, "Internal Server Error");
  }
}