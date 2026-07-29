import type {
  SeoDashboardProjectDto,
  SeoDashboardProjectsResponseDto,
} from '@liora/api-types'

import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { landingApiFetch } from '@/lib/landing-api-client'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import { fetchAiSeoProjects } from './aiSeoProjects.api'

export type DashboardProjectParams = {
  page: number
  pageSize: 10
  search?: string
  status?: 'all' | 'scanning' | 'not_installed' | 'ready'
  sort?: 'updated_desc' | 'updated_asc' | 'favorites'
}

export type ReconcilePublishedProjectsResult = {
  eligible: number
  alreadyLinked: number
  synced: number
  failed: number
  results: Array<{
    pageId: string
    projectId: string | null
    status: 'synced' | 'failed'
    message?: string
  }>
}

export function reconcilePublishedProjects() {
  return landingApiFetch<ReconcilePublishedProjectsResult>(
    '/api/ai-seo/reconcile-published',
    { method: 'POST' },
  )
}

export async function fetchDashboardProjects(
  params: DashboardProjectParams
): Promise<SeoDashboardProjectsResponseDto> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.listDashboardProjects(params)
  }

  // Legacy BFF fallback during the Nest cutover. It intentionally does not
  // invent issue or Umami values that the BFF does not provide.
  const projects = await fetchAiSeoProjects()
  const search = params.search?.trim().toLowerCase() ?? ''
  const filtered = projects
    .filter((project) => {
      if (
        search
        && !project.hostname.toLowerCase().includes(search)
        && !project.name?.toLowerCase().includes(search)
      ) {
        return false
      }
      if (params.status === 'scanning') return project.taskStatus === 'started'
      if (params.status === 'not_installed') {
        return project.pixelTagState !== 'installed'
      }
      if (params.status === 'ready') {
        return project.taskStatus === 'completed'
          && project.pixelTagState === 'installed'
      }
      return true
    })
    .sort((a, b) => {
      const delta = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (params.sort === 'favorites') {
        const favoriteDelta = Number(b.isFavorite) - Number(a.isFavorite)
        return favoriteDelta || delta
      }
      return params.sort === 'updated_asc' ? -delta : delta
    })

  const start = (params.page - 1) * params.pageSize
  return {
    items: filtered
      .slice(start, start + params.pageSize)
      .map(mapLegacyProjectToDashboard),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / params.pageSize)),
    },
  }
}

function mapLegacyProjectToDashboard(
  project: Awaited<ReturnType<typeof fetchAiSeoProjects>>[number]
): SeoDashboardProjectDto {
  return {
    id: project.id,
    projectId: project.projectId || project.id,
    name: project.name?.trim() || project.hostname,
    hostname: project.hostname,
    status: project.status,
    taskStatus:
      project.taskStatus === 'started'
        ? 'running'
        : project.taskStatus === 'completed'
          ? 'done'
          : project.taskStatus,
    pixelTagState: project.pixelTagState,
    isFavorite: project.isFavorite,
    scores: {
      overall: project.scores.graderScore,
      technical: project.scores.technicalScore,
      content: project.scores.contentScore,
      authority: project.scores.authorityScore,
      ux: project.scores.uxScore,
      healthyPages: project.scores.healthyPages,
      totalPages: project.scores.totalPages,
    },
    issues: { critical: 0, warning: 0, info: 0 },
    traffic: {
      status: 'disabled',
      stale: false,
      pageviews: null,
      visitors: null,
      visits: null,
      syncedAt: null,
    },
    lastAnalysis: project.lastScanAt ?? null,
    updatedAt: project.updatedAt,
  }
}
