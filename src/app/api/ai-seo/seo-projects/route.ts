import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../mockDb";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id") || "org-1";

    if (!supabase) {
      return NextResponse.json(mockDb.getSeoProjects(orgId));
    }

    // Fetch parent projects of this organization, then fetch seo projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id")
      .eq("organization_id", orgId);

    if (projectsError || !projects) {
      return NextResponse.json(mockDb.getSeoProjects(orgId));
    }

    const projectIds = projects.map(p => p.id);

    const { data, error } = await supabase
      .from("seo_projects")
      .select("*")
      .in("project_id", projectIds);

    if (error) {
      console.warn("Supabase fetch seo projects error, using mockDb:", error);
      return NextResponse.json(mockDb.getSeoProjects(orgId));
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET seo projects error:", err);
    return NextResponse.json(mockDb.getSeoProjects("org-1"));
  }
}

export async function POST(request: NextRequest) {
  const orgId = request.headers.get("x-org-id") || "org-1";
  let websiteUrl = "https://example.com";
  let projectName = "SEO Project";
  let countryCode = "VN";
  let languageCode = "vi";
  let crawlBudget = 100;
  let userAgent = "AI-SEO-Bot";
  let crawlConcurrency = 2;
  let respectRobotsTxt = true;
  let urlExclusionRules: string[] = [];

  try {
    const body = await request.json();

    if (!body.websiteUrl || !body.projectName) {
      return NextResponse.json(
        { error: "Missing required parameters: websiteUrl and projectName" },
        { status: 400 }
      );
    }

    websiteUrl = body.websiteUrl;
    projectName = body.projectName;
    countryCode = body.countryCode ?? countryCode;
    languageCode = body.languageCode ?? languageCode;
    crawlBudget = body.crawlBudget ?? crawlBudget;
    userAgent = body.userAgent ?? userAgent;
    crawlConcurrency = body.crawlConcurrency ?? crawlConcurrency;
    respectRobotsTxt = body.respectRobotsTxt ?? respectRobotsTxt;
    urlExclusionRules = body.urlExclusionRules ?? urlExclusionRules;

    // Extract domain from websiteUrl
    let domain = websiteUrl;
    try {
      const parsed = new URL(websiteUrl);
      domain = parsed.hostname;
    } catch {
      // Fallback
    }

    // 1. Check Quota (Inspecting 'seo_audits' definition)
    if (supabase) {
      // Fetch the quota definition for 'seo_audits'
      const { data: quotaDef } = await supabase
        .from("quota_definitions")
        .select("id")
        .eq("name", "seo_audits")
        .single();

      if (quotaDef) {
        // Check current balance
        const { data: balance } = await supabase
          .from("quota_balances")
          .select("balance")
          .eq("organization_id", orgId)
          .eq("quota_definition_id", quotaDef.id)
          .single();

        if (balance && balance.balance <= 0) {
          return NextResponse.json({ error: "Insufficient quota. Your organization has 0 audits remaining." }, { status: 403 });
        }

        // Deduct quota
        if (balance) {
          await supabase
            .from("quota_balances")
            .update({ balance: balance.balance - 1 })
            .eq("organization_id", orgId)
            .eq("quota_definition_id", quotaDef.id);

          // Log quota usage
          await supabase
            .from("quota_usage_logs")
            .insert({
              organization_id: orgId,
              quota_definition_id: quotaDef.id,
              amount: -1,
              action: `Created SEO project for domain: ${domain}`
            });
        }
      }
    }

    // 2. Create Project and Settings
    if (!supabase) {
      const result = mockDb.createSeoProjectWithWizard(
        orgId,
        projectName,
        websiteUrl,
        countryCode,
        languageCode,
        crawlBudget,
        userAgent,
        crawlConcurrency,
        respectRobotsTxt,
        urlExclusionRules
      );
      return NextResponse.json(result.seoProject);
    }

    // Prefer Supabase wizard tables; if schema incomplete (e.g. missing public.projects),
    // fall back to mockDb so local/dev without full SEO schema still works.
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ organization_id: orgId, name: projectName })
      .select()
      .single();

    if (projectError || !project) {
      console.warn(
        "Supabase parent project create failed, using mockDb:",
        projectError?.message ?? "no row"
      );
      const result = mockDb.createSeoProjectWithWizard(
        orgId,
        projectName,
        websiteUrl,
        countryCode,
        languageCode,
        crawlBudget,
        userAgent,
        crawlConcurrency,
        respectRobotsTxt,
        urlExclusionRules
      );
      return NextResponse.json(result.seoProject);
    }

    // Create seo project
    const { data: seoProject, error: seoProjectError } = await supabase
      .from("seo_projects")
      .insert({ project_id: project.id, domain })
      .select()
      .single();

    if (seoProjectError || !seoProject) {
      console.warn(
        "Supabase seo_projects create failed, using mockDb:",
        seoProjectError?.message ?? "no row"
      );
      const result = mockDb.createSeoProjectWithWizard(
        orgId,
        projectName,
        websiteUrl,
        countryCode,
        languageCode,
        crawlBudget,
        userAgent,
        crawlConcurrency,
        respectRobotsTxt,
        urlExclusionRules
      );
      return NextResponse.json(result.seoProject);
    }

    // Best-effort related rows (ignore missing tables)
    await Promise.allSettled([
      supabase.from("seo_project_settings").insert({
        seo_project_id: seoProject.id,
        country_code: countryCode,
        language_code: languageCode,
      }),
      supabase.from("crawl_settings").insert({
        seo_project_id: seoProject.id,
        crawl_budget: crawlBudget,
        user_agent: userAgent,
        crawl_concurrency: crawlConcurrency,
        respect_robots_txt: respectRobotsTxt,
        url_exclusion_rules: urlExclusionRules,
      }),
      supabase.from("seo_project_business_profiles").insert({
        seo_project_id: seoProject.id,
        business_name: projectName,
        language: languageCode,
      }),
      supabase.from("seo_project_integrations").insert({
        seo_project_id: seoProject.id,
      }),
      supabase.from("seo_project_installations").insert({
        seo_project_id: seoProject.id,
        installation_type: "custom_script",
        script_tag: `<script async src="https://api.otto-seo.com/sdk/${seoProject.id}.js"></script>`,
        status: "not_installed",
      }),
    ]);

    return NextResponse.json(seoProject);
  } catch (err: any) {
    console.error("POST seo projects error:", err);
    // Last resort: mock wizard so UI is not blocked by partial Supabase schema
    try {
      const result = mockDb.createSeoProjectWithWizard(
        orgId,
        projectName,
        websiteUrl,
        countryCode,
        languageCode,
        crawlBudget,
        userAgent,
        crawlConcurrency,
        respectRobotsTxt,
        urlExclusionRules
      );
      return NextResponse.json(result.seoProject);
    } catch {
      return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
  }
}
