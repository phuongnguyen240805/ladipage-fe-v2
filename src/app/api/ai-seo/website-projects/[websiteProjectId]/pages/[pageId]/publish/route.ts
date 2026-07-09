import { NextRequest, NextResponse } from "next/server";

import { publishLandingPageServer } from "@/features/landing-publish/services/landing-publish.service";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getVirtualProjectId, shouldFallbackToMock, jsonError } from "../../../../../apiUtils";
import { mockDb } from "../../../../../mockDb";
import { requireLandingPageOwner } from "@/app/api/landing-pages/_ownership";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ websiteProjectId: string; pageId: string }> }
) {
  try {
    const { websiteProjectId, pageId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();

    if (!getSupabaseAdmin()) {
      if (fallbackEnabled) {
        const published = mockDb.publishWebsitePage(websiteProjectId, pageId);
        return NextResponse.json(published || { error: "Page not found" }, { status: published ? 200 : 404 });
      }
      return jsonError(new Error("Supabase client is not configured"), "Supabase not configured");
    }

    const supabase = getSupabaseAdmin()!;
    const virtualProjectId = getVirtualProjectId(orgId);

    if (
      websiteProjectId === virtualProjectId ||
      websiteProjectId === "da7b00d0-ba5e-4444-a1a1-000000000000" ||
      websiteProjectId === "default-builder-project"
    ) {
      const auth = await requireLandingPageOwner(request);
      if ("error" in auth) {
        return auth.error;
      }

      try {
        const result = await publishLandingPageServer({
          supabase,
          pageId,
          ownerId: auth.ownerId,
        });

        const { data: wpPage } = await supabase
          .from("website_pages")
          .select("*")
          .eq("id", pageId)
          .maybeSingle();

        return NextResponse.json(
          wpPage || {
            id: pageId,
            organization_id: orgId,
            website_project_id: virtualProjectId,
            project_id: "default-project",
            title: result.slug,
            slug: result.slug,
            page_url: result.publicUrl,
            page_type: "landing_page",
            status: "published",
            published_url: result.publicUrl,
            updated_at: result.publishedAt,
          },
        );
      } catch (error) {
        const status = (error as { status?: number }).status ?? 500;
        const message = error instanceof Error ? error.message : "Failed to publish landing page";
        return NextResponse.json({ error: message }, { status });
      }
    }

    const { data, error } = await supabase
      .from("website_pages")
      .update({
        status: "published",
        published_url: `/p/${pageId}`,
        sync_status: "synced",
        last_synced_at: new Date().toISOString(),
        updated_at: new Date(),
      })
      .eq("id", pageId)
      .eq("website_project_id", websiteProjectId)
      .select()
      .single();

    if (error || !data) {
      if (fallbackEnabled) {
        const published = mockDb.publishWebsitePage(websiteProjectId, pageId);
        return NextResponse.json(published || { error: "Page not found" }, { status: published ? 200 : 404 });
      }
      return jsonError(error, "Failed to publish page");
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("POST publish website-page error:", err);
    if (shouldFallbackToMock()) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return jsonError(err, "Internal Server Error");
  }
}