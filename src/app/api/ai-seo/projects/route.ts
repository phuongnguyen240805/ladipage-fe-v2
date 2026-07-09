import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { jsonError, shouldFallbackToMock } from "../apiUtils";
import { mockDb } from "../mockDb";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getSupabaseWithJwt(jwt: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const jwt = auth.slice(7).trim();
  const client = getSupabaseWithJwt(jwt);
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user?.id || null;
}

function buildScores(raw: Record<string, unknown>) {
  const afterSummary = (raw.afterSummary as Record<string, number>) ?? {};
  const holistic = (raw.holisticScores as Record<string, number>) ?? {};
  const ready = Boolean(raw.readyForProcessing);

  return {
    healthyPages: afterSummary.healthyPages ?? 0,
    totalPages: afterSummary.totalPages ?? 0,
    graderScore: ready ? Number(raw.aiGradeOverall ?? 0) : 0,
    contentScore: ready ? Number(holistic.contentScore ?? 0) : 0,
    authorityScore: ready ? Number(holistic.authorityScore ?? 0) : 0,
    technicalScore: ready ? Number(holistic.technicalsScore ?? 0) : 0,
    uxScore: ready ? Number(holistic.uxScore ?? 0) : 0,
  };
}

/** Chuẩn hóa payload cho dashboard AI SEO (giống easy-manager /ai-seo khi chưa kết nối). */
export function normalizeDashboardProject(raw: Record<string, unknown>) {
  const hostname = String(raw.hostname ?? raw.domain ?? raw.slug ?? "untitled");
  const connectedData = (raw.connectedData as Record<string, unknown>) ?? {
    isGscConnected: false,
    isGbpConnected: false,
    gscDetails: {},
    gbpDetailsV2: {},
  };

  const afterSummary = (raw.afterSummary as Record<string, number>) ?? {
    healthyPages: 0,
    totalPages: 0,
  };

  const holisticScores = (raw.holisticScores as Record<string, number>) ?? {
    technicalsScore: 0,
    uxScore: 0,
    authorityScore: 0,
    contentScore: 0,
  };

  const pixelTagState =
    (raw.pixelTagState as string) ||
    (raw.pixel_tag_state as string) ||
    "not_installed";

  const isEngaged = raw.isEngaged !== false && raw.is_engaged !== false;

  return {
    id: raw.id,
    uuid: raw.uuid ?? raw.id,
    organizationId: raw.organizationId ?? raw.organization_id ?? "",
    projectId: raw.projectId ?? raw.project_id ?? raw.id,
    domain: hostname,
    hostname,
    name: raw.name ?? hostname,
    slug: raw.slug ?? hostname,
    status: raw.isFrozen || raw.is_frozen ? "deep_frozen" : "active",
    siteAudit: raw.siteAudit ?? raw.site_audit ?? {},
    readyForProcessing: Boolean(raw.readyForProcessing ?? raw.ready_for_processing),
    isFirstProcessing: Boolean(raw.isFirstProcessing ?? raw.is_first_processing ?? true),
    taskStatus: raw.taskStatus ?? raw.task_status ?? "pending",
    pixelTagState,
    isFrozen: Boolean(raw.isFrozen ?? raw.is_frozen),
    isFavorite: Boolean(raw.isFavorite ?? raw.is_favorite),
    isEngaged,
    agentStatus: isEngaged ? "engaged" : "disengaged",
    atRiskOfWipe: Boolean(raw.atRiskOfWipe ?? raw.at_risk_of_wipe),
    daysUntilWipe: raw.daysUntilWipe ?? raw.days_until_wipe ?? null,
    wipeScheduledAt: raw.wipeScheduledAt ?? raw.wipe_scheduled_at ?? null,
    lastAnalysis: raw.lastAnalysis ?? raw.last_analysis ?? null,
    nextAnalysisAt: raw.nextAnalysisAt ?? raw.next_analysis_at ?? null,
    timeSavedTotal: Number(raw.timeSavedTotal ?? raw.time_saved_total ?? 0),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    publishedAt: raw.publishedAt ?? raw.published_at ?? null,
    connectedData,
    gscConnected: Boolean(connectedData.isGscConnected),
    gbpConnected: Boolean(connectedData.isGbpConnected),
    gscDetails: connectedData.gscDetails ?? {},
    gbpDetails: connectedData.gbpDetailsV2 ?? {},
    afterSummary,
    holisticScores,
    aiGradeOverall: Number(raw.aiGradeOverall ?? raw.ai_grade_overall ?? 0),
    scores: buildScores({
      afterSummary,
      holisticScores,
      aiGradeOverall: raw.aiGradeOverall ?? raw.ai_grade_overall ?? 0,
      readyForProcessing: raw.readyForProcessing ?? raw.ready_for_processing,
    }),
    lastScanAt: raw.lastAnalysis ?? raw.last_analysis ?? null,
    nextScanAt: raw.nextAnalysisAt ?? raw.next_analysis_at ?? null,
  };
}

function mapMockProjects(orgId: string) {
  return mockDb.getAiSeoProjects(orgId).map((project) =>
    normalizeDashboardProject(project as unknown as Record<string, unknown>),
  );
}

async function fetchAiSeoProjectsFromDb(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  orgId: string,
) {
  const { data: orgProjects, error: orgProjectsError } = await supabase
    .from("projects")
    .select("id")
    .eq("organization_id", orgId);

  if (orgProjectsError || !orgProjects?.length) {
    return [];
  }

  const projectIds = orgProjects.map((row) => row.id);

  const { data, error } = await supabase
    .from("ai_seo_projects")
    .select(`
      *,
      ai_seo_project_scores (
        healthy_pages,
        total_pages,
        ai_grade_overall,
        technicals_score,
        ux_score,
        authority_score,
        content_score
      ),
      ai_seo_project_integrations (
        is_gsc_connected,
        is_gbp_connected,
        gsc_details,
        gbp_details_v2
      )
    `)
    .in("project_id", projectIds)
    .order("updated_at", { ascending: false });

  if (error || !data?.length) {
    return [];
  }

  return data.map((row: Record<string, unknown>) => {
    const scores = row.ai_seo_project_scores as Record<string, unknown> | null;
    const integrations = row.ai_seo_project_integrations as Record<string, unknown> | null;

    return normalizeDashboardProject({
      id: row.id,
      uuid: row.uuid,
      projectId: row.project_id,
      hostname: row.hostname,
      siteAudit: row.site_audit,
      readyForProcessing: row.ready_for_processing,
      isFirstProcessing: row.is_first_processing,
      taskStatus: row.task_status,
      pixelTagState: row.pixel_tag_state,
      isFrozen: row.is_frozen,
      isFavorite: row.is_favorite,
      isEngaged: row.is_engaged,
      atRiskOfWipe: row.at_risk_of_wipe,
      daysUntilWipe: row.days_until_wipe,
      wipeScheduledAt: row.wipe_scheduled_at,
      lastAnalysis: row.last_analysis,
      nextAnalysisAt: row.next_analysis_at,
      timeSavedTotal: row.time_saved_total,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      connectedData: integrations
        ? {
            isGscConnected: integrations.is_gsc_connected,
            isGbpConnected: integrations.is_gbp_connected,
            gscDetails: integrations.gsc_details ?? {},
            gbpDetailsV2: integrations.gbp_details_v2 ?? {},
          }
        : undefined,
      afterSummary: scores
        ? {
            healthyPages: scores.healthy_pages ?? 0,
            totalPages: scores.total_pages ?? 0,
          }
        : undefined,
      holisticScores: scores
        ? {
            technicalsScore: scores.technicals_score ?? 0,
            uxScore: scores.ux_score ?? 0,
            authorityScore: scores.authority_score ?? 0,
            contentScore: scores.content_score ?? 0,
          }
        : undefined,
      aiGradeOverall: scores?.ai_grade_overall ?? 0,
    });
  });
}

async function fetchLandingPagesAsProjects(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  userId: string | null,
) {
  let query = supabase.from("landing_pages").select("*").order("updated_at", { ascending: false });

  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.is.null`);
  }

  const { data: landingPages, error } = await query;
  if (error || !landingPages?.length) {
    return [];
  }

  return landingPages.map((lp: Record<string, unknown>) =>
    normalizeDashboardProject({
      id: lp.id,
      uuid: lp.id,
      projectId: lp.id,
      hostname: lp.slug || lp.name || "untitled",
      name: lp.name || "Untitled Page",
      slug: lp.slug,
      readyForProcessing: false,
      isFirstProcessing: true,
      taskStatus: "pending",
      pixelTagState: "not_installed",
      isFrozen: false,
      isFavorite: false,
      isEngaged: true,
      atRiskOfWipe: false,
      createdAt: lp.created_at,
      updatedAt: lp.updated_at,
      publishedAt: lp.published_at,
    }),
  );
}

/**
 * GET /api/ai-seo/projects
 * Dashboard AI SEO — trạng thái chưa kết nối (pixel/GSC) giống bản demo easy-manager.
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id") || "org-1";
    const fallbackEnabled = shouldFallbackToMock();
    const supabase = getSupabaseAdmin();
    const userId = await getUserId(request);

    if (!supabase) {
      return NextResponse.json(mapMockProjects(orgId));
    }

    let projects = await fetchAiSeoProjectsFromDb(supabase, orgId);

    if (!projects.length) {
      projects = await fetchLandingPagesAsProjects(supabase, userId);
    }

    if (
      !projects.length &&
      (!userId || fallbackEnabled || process.env.NODE_ENV !== "production")
    ) {
      return NextResponse.json(mapMockProjects(orgId));
    }

    return NextResponse.json(projects);
  } catch (err: unknown) {
    console.error("GET /api/ai-seo/projects error:", err);
    const orgId = request.headers.get("x-org-id") || "org-1";
    if (shouldFallbackToMock()) {
      return NextResponse.json(mapMockProjects(orgId));
    }
    return jsonError(err, "Lỗi máy chủ");
  }
}

/**
 * POST /api/ai-seo/projects
 * Tạo dự án AI SEO mới (wizard quick-create).
 */
export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id") || "org-1";
    const body = await request.json();
    const { hostname, name } = body;

    if (!hostname) {
      return NextResponse.json({ error: "Thiếu tham số: hostname (tên miền trang)" }, { status: 400 });
    }

    if (!getSupabaseAdmin() || shouldFallbackToMock()) {
      const created = mockDb.createAiSeoProject(orgId, hostname, name || hostname);
      return NextResponse.json(
        normalizeDashboardProject(created as unknown as Record<string, unknown>),
      );
    }

    const supabase = getSupabaseAdmin()!;

    const { data: parentProject, error: parentError } = await supabase
      .from("projects")
      .insert({ organization_id: orgId, name: name || hostname })
      .select("id")
      .single();

    if (parentError || !parentProject) {
      const created = mockDb.createAiSeoProject(orgId, hostname, name || hostname);
      return NextResponse.json(
        normalizeDashboardProject(created as unknown as Record<string, unknown>),
      );
    }

    const { data: aiProject, error: aiError } = await supabase
      .from("ai_seo_projects")
      .insert({
        project_id: parentProject.id,
        hostname,
        pixel_tag_state: "not_installed",
        task_status: "pending",
        is_engaged: true,
      })
      .select()
      .single();

    if (aiError || !aiProject) {
      const created = mockDb.createAiSeoProject(orgId, hostname, name || hostname);
      return NextResponse.json(
        normalizeDashboardProject(created as unknown as Record<string, unknown>),
      );
    }

    await supabase.from("ai_seo_project_scores").insert({ ai_seo_project_id: aiProject.id });
    await supabase.from("ai_seo_project_integrations").insert({ ai_seo_project_id: aiProject.id });

    return NextResponse.json(
      normalizeDashboardProject({
        id: aiProject.id,
        uuid: aiProject.uuid,
        projectId: aiProject.project_id,
        hostname: aiProject.hostname,
        readyForProcessing: false,
        isFirstProcessing: true,
        taskStatus: "pending",
        pixelTagState: "not_installed",
        isEngaged: true,
        createdAt: aiProject.created_at,
        updatedAt: aiProject.updated_at,
      }),
    );
  } catch (err: unknown) {
    console.error("POST /api/ai-seo/projects error:", err);
    return jsonError(err, "Lỗi máy chủ");
  }
}