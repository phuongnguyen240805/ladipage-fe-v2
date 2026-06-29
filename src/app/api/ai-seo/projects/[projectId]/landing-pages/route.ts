import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";
import { shouldFallbackToMock, jsonError } from "../../../apiUtils";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!supabase) {
      if (fallbackEnabled) {
        const pages = mockDb.getAiSeoProjectPages(projectId);
        return NextResponse.json(pages);
      }
      return jsonError(new Error("Supabase client is not configured"), "Supabase not configured");
    }

    // 1. Get ai_seo_project
    const { data: aiProj, error: pError } = await supabase
      .from("ai_seo_projects")
      .select("id")
      .eq("project_id", projectId)
      .single();

    if (pError || !aiProj) {
      if (fallbackEnabled) {
        console.warn("AI SEO Project not found in Supabase, using mockDb");
        const pages = mockDb.getAiSeoProjectPages(projectId);
        return NextResponse.json(pages);
      }
      return jsonError(pError || new Error("Project not found"), "AI SEO Project not found");
    }

    // 2. Query pages linked to this project
    const { data: pages, error: pagesError } = await supabase
      .from("ai_seo_project_pages")
      .select(`
        *,
        ai_seo_page_scores (
          grader_score,
          content_score,
          technical_score,
          ux_score,
          authority_score
        )
      `)
      .eq("ai_seo_project_id", aiProj.id);

    if (pagesError) {
      if (fallbackEnabled) {
        console.warn("Error getting pages from Supabase, using mockDb:", pagesError);
        const pages = mockDb.getAiSeoProjectPages(projectId);
        return NextResponse.json(pages);
      }
      return jsonError(pagesError, "Failed to retrieve linked landing pages");
    }

    // Map to flatter structure matching MockDb return value
    const mapped = pages.map((p: any) => {
      const score = p.ai_seo_page_scores;
      return {
        id: p.id,
        organizationId: p.organization_id,
        aiSeoProjectId: p.ai_seo_project_id,
        projectId: p.project_id,
        websitePageId: p.website_page_id,
        pageUrl: p.page_url,
        pageType: p.page_type,
        source: p.source,
        scanStatus: p.scan_status,
        lastScanJobId: p.last_scan_job_id,
        lastScannedAt: p.last_scanned_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        graderScore: score?.grader_score || 0,
        contentScore: score?.content_score || 0,
        technicalScore: score?.technical_score || 0,
        uxScore: score?.ux_score || 0,
        authorityScore: score?.authority_score || 0
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("GET landing-pages error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return jsonError(err, "Internal Server Error");
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await props.params;
    const body = await request.json();
    const { pageUrl, websitePageId, source = "external" } = body;
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!pageUrl) {
      return NextResponse.json({ error: "Missing pageUrl parameter" }, { status: 400 });
    }

    if (!supabase) {
      if (fallbackEnabled) {
        const linked = mockDb.linkLandingPage(projectId, pageUrl, websitePageId, source);
        return NextResponse.json(linked || { error: "Failed to link" }, { status: linked ? 200 : 400 });
      }
      return jsonError(new Error("Supabase client is not configured"), "Supabase not configured");
    }

    // 1. Get ai_seo_project
    const { data: aiProj, error: pError } = await supabase
      .from("ai_seo_projects")
      .select("id")
      .eq("project_id", projectId)
      .single();

    if (pError || !aiProj) {
      if (fallbackEnabled) {
        console.warn("AI SEO Project not found in Supabase, using mockDb");
        const linked = mockDb.linkLandingPage(projectId, pageUrl, websitePageId, source);
        return NextResponse.json(linked || { error: "Failed to link" }, { status: linked ? 200 : 400 });
      }
      return jsonError(pError || new Error("Project not found"), "AI SEO Project not found");
    }

    // 1.1 Check idempotency
    if (websitePageId) {
      const { data: existingLink, error: checkLinkErr } = await supabase
        .from("ai_seo_project_pages")
        .select("*")
        .eq("ai_seo_project_id", aiProj.id)
        .eq("website_page_id", websitePageId)
        .maybeSingle();

      if (checkLinkErr) {
        return jsonError(checkLinkErr, "Failed to check link existence");
      }
      if (existingLink) {
        return NextResponse.json(existingLink);
      }
    }

    // 2. Insert into ai_seo_project_pages
    const { data: page, error: insertError } = await supabase
      .from("ai_seo_project_pages")
      .insert({
        organization_id: orgId,
        ai_seo_project_id: aiProj.id,
        project_id: projectId,
        website_page_id: websitePageId || null,
        page_url: pageUrl,
        source: source,
        scan_status: "pending"
      })
      .select()
      .single();

    if (insertError || !page) {
      if (fallbackEnabled) {
        console.warn("Supabase link landing page error, using mockDb:", insertError);
        const linked = mockDb.linkLandingPage(projectId, pageUrl, websitePageId, source);
        return NextResponse.json(linked || { error: "Failed to link" }, { status: linked ? 200 : 400 });
      }
      return jsonError(insertError, "Failed to connect landing page to AI SEO project");
    }

    // Create empty scores for the page
    await supabase.from("ai_seo_page_scores").insert({
      organization_id: orgId,
      ai_seo_project_page_id: page.id,
      grader_score: 0,
      content_score: 0,
      technical_score: 0,
      ux_score: 0,
      authority_score: 0
    });

    return NextResponse.json(page);
  } catch (err: any) {
    console.error("POST link landing-page error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return jsonError(err, "Internal Server Error");
  }
}
