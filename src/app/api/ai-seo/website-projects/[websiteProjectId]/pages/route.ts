import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";
import { getVirtualProjectId, shouldFallbackToMock, jsonError } from "../../../apiUtils";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ websiteProjectId: string }> }
) {
  try {
    const { websiteProjectId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!supabase) {
      if (fallbackEnabled) {
        const pages = mockDb.getWebsitePages(websiteProjectId);
        return NextResponse.json(pages);
      }
      return jsonError(new Error("Supabase client not configured"), "Supabase not configured");
    }

    const virtualProjId = getVirtualProjectId(orgId);

    if (websiteProjectId === virtualProjId || websiteProjectId === "da7b00d0-ba5e-4444-a1a1-000000000000" || websiteProjectId === "default-builder-project") {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        if (fallbackEnabled) {
          console.warn("Supabase query landing_pages error, using mockDb:", error);
          const pages = mockDb.getWebsitePages(websiteProjectId);
          return NextResponse.json(pages);
        }
        return jsonError(error, "Failed to retrieve builder landing pages");
      }

      const mappedPages = (data || []).map((page: any) => ({
        id: page.id,
        organization_id: orgId,
        website_project_id: virtualProjId,
        project_id: "default-project",
        title: page.name || "Untitled Page",
        slug: page.slug,
        page_url: `/p/${page.slug}`,
        page_type: "landing_page",
        status: page.status || "draft",
        published_url: page.status === "published" ? `/p/${page.slug}` : null,
        seo_title: page.name || "Untitled Page",
        seo_description: "",
        created_at: page.created_at,
        updated_at: page.updated_at,
      }));

      return NextResponse.json(mappedPages);
    }

    const { data, error } = await supabase
      .from("website_pages")
      .select("*")
      .eq("website_project_id", websiteProjectId);

    if (error) {
      if (fallbackEnabled) {
        console.warn("Supabase query website_pages error, using mockDb:", error);
        const pages = mockDb.getWebsitePages(websiteProjectId);
        return NextResponse.json(pages);
      }
      return jsonError(error, "Failed to retrieve website pages");
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET website-pages error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 550 });
    }
    return jsonError(err, "Internal Server Error");
  }
}
