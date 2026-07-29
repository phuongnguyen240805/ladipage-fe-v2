import type { SupabaseClient } from "@supabase/supabase-js";

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
    updatedAt:
      raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
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

export async function fetchLandingPagesAsProjects(
  supabase: SupabaseClient,
  userId: string | null,
) {
  if (!userId) return [];

  const { data: landingPages, error } = await supabase
    .from("landing_pages")
    .select("id, name, slug, status, updated_at, created_at, published_at, user_id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
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
