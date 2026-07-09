import { NextRequest, NextResponse } from "next/server";

import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";
import { getSupabaseAdmin, getSupabaseAdminConfigError } from "@/lib/supabase-admin";

import { mockDb } from "../../../mockDb";
import { getVirtualProjectId, resolveOrgAndProject, shouldFallbackToMock, jsonError } from "../../../apiUtils";

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
    return orgId;
  } catch {
    return headerOrg || "org-1";
  }
}

function mapLandingPageRow(page: Record<string, unknown>, orgId: string, virtualProjId: string) {
  const rawStatus = String(page.status ?? "draft").toLowerCase();
  const status = rawStatus === "published" ? "published" : "draft";
  const slug = String(page.slug ?? page.id);
  const appBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const publicPath = `/p/${slug}`;
  const absoluteUrl = appBase ? `${appBase}${publicPath}` : publicPath;

  return {
    id: page.id,
    organization_id: orgId,
    website_project_id: virtualProjId,
    project_id: "default-project",
    title: page.name || "Untitled Page",
    slug,
    page_url: publicPath,
    page_type: "landing_page",
    status,
    published_url: status === "published" ? absoluteUrl : null,
    seo_title: page.name || "Untitled Page",
    seo_description: "",
    created_at: page.created_at,
    updated_at: page.updated_at,
  };
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ websiteProjectId: string }> },
) {
  try {
    const auth = await requireLandingPageOwner(request);
    if ("error" in auth) {
      return auth.error;
    }

    const { websiteProjectId } = await props.params;
    const fallbackEnabled = shouldFallbackToMock();
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getWebsitePages(websiteProjectId));
      }
      return jsonError(new Error(getSupabaseAdminConfigError() ?? "missing admin"), "Supabase not configured");
    }

    const orgId = await resolveOrgId(request, supabase, auth.ownerId);
    const virtualProjId = getVirtualProjectId(orgId);
    const isBuilderProject =
      websiteProjectId === virtualProjId ||
      websiteProjectId === "da7b00d0-ba5e-4444-a1a1-000000000000" ||
      websiteProjectId === "default-builder-project";

    if (isBuilderProject) {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("id, name, slug, status, created_at, updated_at")
        .eq("user_id", auth.ownerId)
        .order("updated_at", { ascending: false });

      if (error) {
        if (fallbackEnabled) {
          return NextResponse.json(mockDb.getWebsitePages(websiteProjectId));
        }
        return jsonError(error, "Failed to retrieve builder landing pages");
      }

      const mappedPages = (data ?? []).map((page) =>
        mapLandingPageRow(page as Record<string, unknown>, orgId, virtualProjId),
      );

      return NextResponse.json(mappedPages);
    }

    const { data, error } = await supabase
      .from("website_pages")
      .select("*")
      .eq("website_project_id", websiteProjectId)
      .eq("organization_id", orgId);

    if (error) {
      if (fallbackEnabled) {
        return NextResponse.json(mockDb.getWebsitePages(websiteProjectId));
      }
      return jsonError(error, "Failed to retrieve website pages");
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    console.error("GET website-pages error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return jsonError(err, "Internal Server Error");
  }
}