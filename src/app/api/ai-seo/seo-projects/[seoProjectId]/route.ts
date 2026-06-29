import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../mockDb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ seoProjectId: string }> }
) {
  try {
    const { seoProjectId } = await props.params;

    if (!supabase) {
      const details = mockDb.getSeoProjectDetails(seoProjectId);
      return NextResponse.json(details || { error: "SEO Project not found" }, { status: details ? 200 : 404 });
    }

    const { data: seoProject, error: seoProjectError } = await supabase
      .from("seo_projects")
      .select("*")
      .eq("id", seoProjectId)
      .single();

    if (seoProjectError || !seoProject) {
      const details = mockDb.getSeoProjectDetails(seoProjectId);
      return NextResponse.json(details || { error: "SEO Project not found" }, { status: details ? 200 : 404 });
    }

    // Fetch settings
    const { data: settings } = await supabase
      .from("seo_project_settings")
      .select("*")
      .eq("seo_project_id", seoProjectId)
      .single();

    // Fetch crawl settings
    const { data: crawlSettings } = await supabase
      .from("crawl_settings")
      .select("*")
      .eq("seo_project_id", seoProjectId)
      .single();

    // Fetch business profile
    const { data: businessProfile } = await supabase
      .from("seo_project_business_profiles")
      .select("*")
      .eq("seo_project_id", seoProjectId)
      .single();

    // Fetch integrations
    const { data: integrations } = await supabase
      .from("seo_project_integrations")
      .select("*")
      .eq("seo_project_id", seoProjectId)
      .single();

    // Fetch installation
    const { data: installation } = await supabase
      .from("seo_project_installations")
      .select("*")
      .eq("seo_project_id", seoProjectId)
      .single();

    return NextResponse.json({
      seoProject,
      settings,
      crawlSettings,
      businessProfile,
      integrations,
      installation
    });
  } catch (err: any) {
    console.error("GET seo-project detail error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
