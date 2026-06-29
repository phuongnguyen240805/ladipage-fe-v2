import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../mockDb";
import { getVirtualProjectId, shouldFallbackToMock, jsonError } from "../apiUtils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!supabase) {
      if (fallbackEnabled) {
        const projs = mockDb.getWebsiteProjects(orgId);
        return NextResponse.json(projs);
      }
      return jsonError(new Error("Supabase client is not configured"), "Supabase not configured");
    }

    let projs: any[] = [];
    let dbError: any = null;

    // 1. Try to fetch from custom website_projects table
    try {
      const { data, error } = await supabase
        .from("website_projects")
        .select("*")
        .eq("organization_id", orgId);
      if (error) {
        dbError = error;
      } else if (data) {
        projs = [...data];
      }
    } catch (e) {
      console.warn("Failed to fetch from website_projects table:", e);
      dbError = e;
    }

    // 2. Query standard landing_pages table to check if there are created pages
    try {
      const { data: landingPages, error: lpError } = await supabase
        .from("landing_pages")
        .select("id")
        .limit(1);

      if (lpError) {
        dbError = lpError;
      } else if (landingPages && landingPages.length > 0) {
        // If there are landing pages, inject the virtual project representation
        const virtualProjId = getVirtualProjectId(orgId);
        const hasVirtualProj = projs.some((p: any) => p.id === virtualProjId);
        if (!hasVirtualProj) {
          projs.push({
            id: virtualProjId,
            organization_id: orgId,
            project_id: "default-project",
            name: "Landing Page Builder (Hệ thống)",
            domain: "builder-pages.local",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn("Failed to check landing_pages table:", e);
      dbError = e;
    }

    // If both return nothing, return mock projects or throw error
    if (projs.length === 0) {
      if (dbError && !fallbackEnabled) {
        return jsonError(dbError, "Failed to retrieve website projects");
      }
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getWebsiteProjects(orgId));
      }
    }

    return NextResponse.json(projs);
  } catch (err: any) {
    console.error("GET website-projects error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json(mockDb.getWebsiteProjects("org-1"));
    }
    return jsonError(err, "Internal Server Error");
  }
}
