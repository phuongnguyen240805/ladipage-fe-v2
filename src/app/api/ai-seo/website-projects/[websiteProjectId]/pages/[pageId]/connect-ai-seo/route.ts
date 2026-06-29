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
    const body = await request.json();
    const { aiSeoProjectId } = body;
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!aiSeoProjectId) {
      return NextResponse.json({ error: "Missing aiSeoProjectId parameter" }, { status: 400 });
    }

    if (!supabase) {
      if (fallbackEnabled) {
        const connected = mockDb.connectWebsitePageToAiSeo(websiteProjectId, pageId, aiSeoProjectId);
        return NextResponse.json(connected || { error: "Failed to connect" }, { status: connected ? 200 : 400 });
      }
      return jsonError(new Error("Supabase client is not configured"), "Supabase not configured");
    }

    const virtualProjectId = getVirtualProjectId(orgId);

    // 0. Idempotency Check: if connection already exists, return it
    const { data: existingLink, error: checkLinkError } = await supabase
      .from("ai_seo_project_pages")
      .select("*")
      .eq("ai_seo_project_id", aiSeoProjectId)
      .eq("website_page_id", pageId)
      .maybeSingle();

    if (checkLinkError) {
      return jsonError(checkLinkError, "Failed to verify connection uniqueness");
    }
    if (existingLink) {
      return NextResponse.json(existingLink);
    }

    // Handle Landing Page Builder virtual project case
    if (websiteProjectId === virtualProjectId || websiteProjectId === "da7b00d0-ba5e-4444-a1a1-000000000000" || websiteProjectId === "default-builder-project") {
      // 1. Get AI SEO project info
      const { data: aiProj, error: pError } = await supabase
        .from("ai_seo_projects")
        .select("project_id")
        .eq("id", aiSeoProjectId)
        .single();

      if (pError || !aiProj) {
        console.warn("AI SEO Project not found in Supabase:", pError);
        return NextResponse.json({ error: "AI SEO Project not found" }, { status: 404 });
      }

      // 2. Get landing page info
      const { data: lp, error: lpError } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("id", pageId)
        .single();

      if (lpError || !lp) {
        console.warn("Landing page not found in Supabase:", lpError);
        return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
      }

      // Compensation Transaction states
      let virtualProjectCreated = false;
      let virtualPageCreated = false;

      try {
        // 3. Ensure virtual project exists in website_projects
        const { data: wp, error: wpError } = await supabase
          .from("website_projects")
          .select("id")
          .eq("id", virtualProjectId)
          .maybeSingle();

        if (wpError) throw wpError;

        if (!wp) {
          const { error: insertWpError } = await supabase
            .from("website_projects")
            .insert({
              id: virtualProjectId,
              organization_id: orgId,
              project_id: aiProj.project_id,
              name: "Landing Page Builder (Hệ thống)",
              domain: "builder-pages.local",
              status: "active"
            });

          if (insertWpError) throw insertWpError;
          virtualProjectCreated = true;
        }

        // 4. Ensure shadow page exists in website_pages
        const { error: upsertPageError } = await supabase
          .from("website_pages")
          .upsert({
            id: pageId,
            organization_id: orgId,
            website_project_id: virtualProjectId,
            project_id: aiProj.project_id,
            title: lp.name || "Untitled Page",
            slug: lp.slug,
            page_url: `/p/${lp.slug}`,
            page_type: "landing_page",
            status: lp.status || "draft",
            published_url: lp.status === "published" ? `/p/${lp.slug}` : null,
            source_type: "builder",
            source_landing_page_id: lp.id,
            sync_status: "synced",
            last_synced_at: new Date().toISOString()
          });

        if (upsertPageError) throw upsertPageError;
        virtualPageCreated = true;

        // 5. Link page to AI SEO project
        const { data: connected, error: connError } = await supabase
          .from("ai_seo_project_pages")
          .insert({
            organization_id: orgId,
            ai_seo_project_id: aiSeoProjectId,
            project_id: aiProj.project_id,
            website_page_id: pageId,
            page_url: `/p/${lp.slug}`,
            source: "internal",
            scan_status: "pending"
          })
          .select()
          .single();

        if (connError || !connected) throw connError || new Error("Failed to insert connection");

        // 6. Insert default scores
        const { error: scoreError } = await supabase.from("ai_seo_page_scores").insert({
          organization_id: orgId,
          ai_seo_project_page_id: connected.id,
          grader_score: 0,
          content_score: 0,
          technical_score: 0,
          ux_score: 0,
          authority_score: 0
        });

        if (scoreError) throw scoreError;

        return NextResponse.json(connected);
      } catch (transError: any) {
        console.error("Connection transaction failed, rolling back:", transError);
        // Rollback created elements
        if (virtualPageCreated) {
          await supabase.from("website_pages").delete().eq("id", pageId);
        }
        if (virtualProjectCreated) {
          await supabase.from("website_projects").delete().eq("id", virtualProjectId);
        }
        return jsonError(transError, "Transaction failed while connecting page");
      }
    }

    // Standard Non-Virtual Website Pages Connection
    const { data: page, error: pageError } = await supabase
      .from("website_pages")
      .select("*")
      .eq("id", pageId)
      .eq("website_project_id", websiteProjectId)
      .single();

    if (pageError || !page) {
      if (fallbackEnabled) {
        console.warn("Page not found in Supabase, using mockDb");
        const connected = mockDb.connectWebsitePageToAiSeo(websiteProjectId, pageId, aiSeoProjectId);
        return NextResponse.json(connected || { error: "Failed to connect" }, { status: connected ? 200 : 400 });
      }
      return jsonError(pageError || new Error("Page not found"), "Website page not found");
    }

    // Insert to ai_seo_project_pages
    const { data: connected, error: connError } = await supabase
      .from("ai_seo_project_pages")
      .insert({
        organization_id: page.organization_id,
        ai_seo_project_id: aiSeoProjectId,
        project_id: page.project_id,
        website_page_id: page.id,
        page_url: page.published_url || page.page_url,
        source: "internal",
        scan_status: "pending"
      })
      .select()
      .single();

    if (connError || !connected) {
      if (fallbackEnabled) {
        console.warn("Supabase connect error, using mockDb:", connError);
        const connectedMock = mockDb.connectWebsitePageToAiSeo(websiteProjectId, pageId, aiSeoProjectId);
        return NextResponse.json(connectedMock || { error: "Failed to connect" }, { status: connectedMock ? 200 : 400 });
      }
      return jsonError(connError, "Failed to connect website page to AI SEO project");
    }

    // Insert scores
    await supabase.from("ai_seo_page_scores").insert({
      organization_id: page.organization_id,
      ai_seo_project_page_id: connected.id,
      grader_score: 0,
      content_score: 0,
      technical_score: 0,
      ux_score: 0,
      authority_score: 0
    });

    return NextResponse.json(connected);
  } catch (err: any) {
    console.error("POST connect-ai-seo error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 550 });
    }
    return jsonError(err, "Internal Server Error");
  }
}
