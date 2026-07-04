import type { SeoProjectDto, SeoTaskDto } from '@liora/api-types'

import type {
  AgentStatus,
  AiSeoPageScore,
  AiSeoPageTask,
  AiSeoProjectListItem,
  AiSeoProjectPage,
  AiSeoScores,
  InstallationStatus,
  ProcessingStatus,
  SeoTask,
} from '@/features/ai-seo/types'

export type NestJobDetails = {
  jobId: string
  taskId?: string
  projectId?: string
  status: string
  progress?: number | null
  result?: Record<string, unknown>
}

export type FeJobDetails = {
  id: string
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled'
  project_id?: string
  [key: string]: unknown
}

function score(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

export function mapJobStatus(
  beStatus: string
): FeJobDetails['status'] {
  const normalized = beStatus.toLowerCase()
  if (['done', 'completed', 'complete', 'success', 'succeeded'].includes(normalized)) {
    return 'success'
  }
  if (['failed', 'error', 'cancelled', 'canceled'].includes(normalized)) {
    return normalized.startsWith('cancel') ? 'cancelled' : 'failed'
  }
  if (['running', 'started', 'pending', 'in_progress'].includes(normalized)) {
    return 'running'
  }
  return 'queued'
}

export function mapNestJobToFeJob(job: NestJobDetails): FeJobDetails {
  return {
    id: job.jobId,
    jobId: job.jobId,
    project_id: job.projectId,
    status: mapJobStatus(job.status),
    progress: job.progress ?? null,
    result: job.result ?? {},
  }
}

function mapPixelToInstallation(pixelTagState: string): InstallationStatus {
  if (pixelTagState === 'installed') return 'installed'
  if (pixelTagState === 'checking') return 'installing'
  if (pixelTagState === 'failed') return 'failed'
  return 'not_installed'
}

function mapTaskToProcessing(taskStatus: string): ProcessingStatus {
  if (taskStatus === 'running') return 'started'
  if (taskStatus === 'done') return 'ready'
  if (taskStatus === 'failed') return 'failed'
  if (taskStatus === 'pending') return 'pending'
  return 'not_started'
}

function mapTaskToCardStatus(
  taskStatus: string
): AiSeoProjectListItem['taskStatus'] {
  if (taskStatus === 'running') return 'started'
  if (taskStatus === 'done') return 'completed'
  if (taskStatus === 'failed') return 'failed'
  return 'pending'
}

function buildScores(dto: SeoProjectDto): AiSeoScores {
  const holistic = dto.holisticScores ?? {}
  return {
    healthyPages: dto.afterSummary?.healthyPages ?? 0,
    totalPages: dto.afterSummary?.totalPages ?? 0,
    graderScore: score(dto.aiGradeOverall ?? holistic.aiGradeOverall),
    contentScore: score(holistic.contentScore),
    authorityScore: score(holistic.authorityScore),
    technicalScore: score(holistic.technicalsScore),
    uxScore: score(holistic.uxScore),
  }
}

export function mapSeoProjectDtoToListItem(dto: SeoProjectDto): AiSeoProjectListItem {
  const connected = dto.connectedData ?? {
    isGscConnected: false,
    isGbpConnected: false,
    gscDetails: {},
    gbpDetailsV2: {},
  }

  return {
    id: dto.id,
    uuid: dto.uuid ?? dto.id,
    organizationId: '',
    projectId: dto.projectId ?? dto.id,
    domain: dto.hostname,
    hostname: dto.hostname,
    status: (dto.status as AiSeoProjectListItem['status']) || 'active',
    isFavorite: dto.isFavorite ?? false,
    installationStatus: mapPixelToInstallation(dto.pixelTagState),
    processingStatus: mapTaskToProcessing(dto.taskStatus),
    readyForProcessing: dto.readyForProcessing ?? true,
    taskStatus: mapTaskToCardStatus(dto.taskStatus),
    agentStatus: (dto.isEngaged ? 'engaged' : 'disengaged') as AgentStatus,
    pixelTagState: (dto.pixelTagState as AiSeoProjectListItem['pixelTagState']) || 'not_installed',
    detectedCms: null,
    isFrozen: dto.isFrozen ?? false,
    atRiskOfWipe: dto.atRiskOfWipe ?? false,
    daysUntilWipe: dto.daysUntilWipe ?? null,
    wipeScheduledAt: dto.wipeScheduledAt ?? null,
    gscConnected: connected.isGscConnected ?? false,
    gbpConnected: connected.isGbpConnected ?? false,
    gscDetails: connected.gscDetails,
    gbpDetails: connected.gbpDetailsV2,
    connectedData: connected,
    afterSummary: dto.afterSummary,
    holisticScores: dto.holisticScores,
    aiGradeOverall: dto.aiGradeOverall,
    scores: buildScores(dto),
    lastScanAt: dto.lastAnalysis ?? null,
    nextScanAt: dto.nextAnalysisAt ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function mapSeoProjectDtosToListItems(dtos: SeoProjectDto[]): AiSeoProjectListItem[] {
  return dtos.map(mapSeoProjectDtoToListItem)
}

export function mapNestLandingPage(page: Record<string, unknown>): AiSeoProjectPage {
  return {
    id: String(page.id ?? ''),
    organizationId: String(page.organizationId ?? ''),
    aiSeoProjectId: String(page.aiSeoProjectId ?? page.projectId ?? ''),
    projectId: String(page.projectId ?? ''),
    websitePageId: (page.websitePageId as string | null) ?? null,
    pageUrl: String(page.pageUrl ?? ''),
    pageType: String(page.pageType ?? 'landing_page'),
    source: (page.source as AiSeoProjectPage['source']) ?? 'external',
    scanStatus: (page.scanStatus as AiSeoProjectPage['scanStatus']) ?? 'pending',
    lastScanJobId: (page.lastScanJobId as string | null) ?? null,
    lastScannedAt: (page.lastScannedAt as string | null) ?? null,
    createdAt: String(page.createdAt ?? new Date().toISOString()),
    updatedAt: String(page.updatedAt ?? new Date().toISOString()),
    graderScore: score(page.graderScore),
    contentScore: score(page.contentScore),
    technicalScore: score(page.technicalScore),
    uxScore: score(page.uxScore),
    authorityScore: score(page.authorityScore),
  }
}

export function mapNestPageScore(raw: Record<string, unknown>): AiSeoPageScore {
  return {
    id: String(raw.id ?? ''),
    organization_id: String(raw.organization_id ?? ''),
    ai_seo_project_page_id: String(raw.ai_seo_project_page_id ?? raw.id ?? ''),
    grader_score: score(raw.grader_score ?? raw.graderScore),
    content_score: score(raw.content_score ?? raw.contentScore),
    technical_score: score(raw.technical_score ?? raw.technicalScore),
    ux_score: score(raw.ux_score ?? raw.uxScore),
    authority_score: score(raw.authority_score ?? raw.authorityScore),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? new Date().toISOString()),
  }
}

export function mapNestPageTask(raw: Record<string, unknown>): AiSeoPageTask {
  return {
    id: String(raw.id ?? ''),
    organization_id: String(raw.organization_id ?? ''),
    ai_seo_project_page_id: String(raw.ai_seo_project_page_id ?? ''),
    ai_seo_project_id: String(raw.ai_seo_project_id ?? ''),
    title: String(raw.title ?? 'SEO task'),
    description: String(raw.description ?? ''),
    category: String(raw.category ?? 'general'),
    priority: (raw.priority as AiSeoPageTask['priority']) ?? 'medium',
    status: (raw.status as AiSeoPageTask['status']) ?? 'todo',
    before_value: (raw.before_value as string | null) ?? null,
    after_value: (raw.after_value as string | null) ?? null,
    created_at: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? new Date().toISOString()),
  }
}

export function mapSeoTaskDtoToFeTask(dto: SeoTaskDto): SeoTask {
  const payload = dto.payload ?? {}
  const result = dto.result ?? {}
  const storedFeStatus = result.feStatus as SeoTask['status'] | undefined
  const feStatus =
    storedFeStatus ??
    (dto.status === 'deployed' || dto.status === 'approved'
      ? 'completed'
      : dto.status === 'rejected'
        ? 'todo'
        : 'todo')

  return {
    id: dto.id,
    project_id: dto.projectId,
    title: String(payload.title ?? result.title ?? `${dto.type} task`),
    description: String(payload.description ?? result.description ?? ''),
    importance: (payload.priority as SeoTask['importance']) ??
      (payload.importance as SeoTask['importance']) ??
      'medium',
    status: feStatus,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
  }
}

export function mapSeoTaskDtosToFeTasks(dtos: SeoTaskDto[]): SeoTask[] {
  return dtos.map(mapSeoTaskDtoToFeTask)
}