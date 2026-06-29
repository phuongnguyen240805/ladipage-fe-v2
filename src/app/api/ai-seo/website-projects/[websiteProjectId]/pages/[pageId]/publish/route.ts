import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../../../mockDb";
import { getVirtualProjectId, shouldFallbackToMock, jsonError } from "../../../../../apiUtils";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ websiteProjectId: string; pageId: string }> }
) {
  try {
    const { websiteProjectId, pageId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!supabase) {
      if (fallbackEnabled) {
        const published = mockDb.publishWebsitePage(websiteProjectId, pageId);
        return NextResponse.json(published || { error: "Page not found" }, { status: published ? 200 : 404 });
      }
      return jsonError(new Error("Supabase client is not configured"), "Supabase not configured");
    }

    const virtualProjectId = getVirtualProjectId(orgId);

    if (websiteProjectId === virtualProjectId || websiteProjectId === "da7b00d0-ba5e-4444-a1a1-000000000000" || websiteProjectId === "default-builder-project") {
      // 1. Get landing page slug and published_html
      const { data: lp, error: lpError } = await supabase
        .from("landing_pages")
        .select("slug, name, published_html")
        .eq("id", pageId)
        .single();

      if (lpError || !lp) {
        console.warn("Landing page not found in Supabase:", lpError);
        return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
      }

      let finalHtml = lp.published_html || "";
      try {
        const { data: connectedPage } = await supabase
          .from("ai_seo_project_pages")
          .select("ai_seo_project_id")
          .eq("website_page_id", pageId)
          .maybeSingle();

        if (connectedPage && connectedPage.ai_seo_project_id && finalHtml) {
          const scriptTag = `<script async src="https://api.otto-seo.com/sdk/${connectedPage.ai_seo_project_id}.js"></script>`;
          if (!finalHtml.includes(scriptTag)) {
            if (finalHtml.includes("</head>")) {
              finalHtml = finalHtml.replace("</head>", `${scriptTag}</head>`);
            } else {
              finalHtml = finalHtml + scriptTag;
            }
          }
        }
      } catch (err) {
        console.warn("Failed to check AI SEO script connection during API publish:", err);
      }

      // 2. Update landing_pages status and html
      const { data: lpUpdated, error: lpUpdateError } = await supabase
        .from("landing_pages")
        .update({
          published_html: finalHtml,
          status: "published",
          visibility: "public",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", pageId)
        .select()
        .single();

      if (lpUpdateError) {
        console.warn("Failed to update status in landing_pages:", lpUpdateError);
        return NextResponse.json({ error: "Failed to publish landing page" }, { status: 500 });
      }

      // 3. Update shadow in website_pages
      const { data: wpPage, error: wpPageError } = await supabase
        .from("website_pages")
        .update({
          status: "published",
          published_url: `/p/${lp.slug}`,
          sync_status: "synced",
          last_synced_at: new Date().toISOString(),
          updated_at: new Date()
        })
        .eq("id", pageId)
        .select()
        .single();

      return NextResponse.json(wpPage || {
        id: pageId,
        organization_id: orgId,
        website_project_id: virtualProjectId,
        project_id: "default-project",
        title: lpUpdated.name,
        slug: lpUpdated.slug,
        page_url: `/p/${lpUpdated.slug}`,
        page_type: "landing_page",
        status: "published",
        published_url: `/p/${lpUpdated.slug}`,
        updated_at: new Date().toISOString()
      });
    }

    // Update status to published, update published_url and auto-inject pixel script tag simulation
    const { data, error } = await supabase
      .from("website_pages")
      .update({
        status: "published",
        published_url: `/p/${pageId}`, // simple mapping
        sync_status: "synced",
        last_synced_at: new Date().toISOString(),
        updated_at: new Date()
      })
      .eq("id", pageId)
      .eq("website_project_id", websiteProjectId)
      .select()
      .single();

    if (error || !data) {
      if (fallbackEnabled) {
        console.warn("Supabase publish website_page error, using mockDb:", error);
        const published = mockDb.publishWebsitePage(websiteProjectId, pageId);
        return NextResponse.json(published || { error: "Page not found" }, { status: published ? 200 : 404 });
      }
      return jsonError(error, "Failed to publish page");
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("POST publish website-page error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return jsonError(err, "Internal Server Error");
  }
}
