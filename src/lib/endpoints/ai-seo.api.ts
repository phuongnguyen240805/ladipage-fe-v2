import type {
  CreateSeoProjectPayload,
  KeywordResearchPayload,
  LinkLandingPagePayload,
  ScanProjectPayload,
  SeoProjectDto,
  SeoTaskDto,
} from '@liora/api-types'

import { apiDelete, apiGet, apiPatch, apiPost } from '../api-client'
import type { NestJobDetails } from '../mappers/ai-seo.mapper'

const PREFIX = '/ai-seo'

export const aiSeoApi = {
  listProjects(params?: { page?: number; pageSize?: number; favorite?: boolean; search?: string }) {
    return apiGet<SeoProjectDto[]>(`${PREFIX}/projects`, { params })
  },

  createProject(body: CreateSeoProjectPayload) {
    return apiPost<SeoProjectDto>(`${PREFIX}/projects`, body)
  },

  getProject(id: string) {
    return apiGet<SeoProjectDto>(`${PREFIX}/projects/${encodeURIComponent(id)}`)
  },

  updateProject(id: string, body: Partial<CreateSeoProjectPayload> & { isFavorite?: boolean }) {
    return apiPatch<SeoProjectDto>(`${PREFIX}/projects/${encodeURIComponent(id)}`, body)
  },

  deleteProject(id: string) {
    return apiDelete<{ success: boolean }>(`${PREFIX}/projects/${encodeURIComponent(id)}`)
  },

  toggleFavorite(id: string) {
    return apiPatch<{ id: string; projectId: string; isFavorite: boolean }>(
      `${PREFIX}/projects/${encodeURIComponent(id)}/favorite`
    )
  },

  toggleAgent(id: string) {
    return apiPatch<{ id: string; projectId: string; isEngaged: boolean }>(
      `${PREFIX}/projects/${encodeURIComponent(id)}/agent-status`
    )
  },

  scanProject(id: string, body?: ScanProjectPayload) {
    return apiPost<{ jobId: string; status: string }>(
      `${PREFIX}/projects/${encodeURIComponent(id)}/scan`,
      body ?? {}
    )
  },

  listLandingPages(projectId: string) {
    return apiGet<Record<string, unknown>[]>(
      `${PREFIX}/projects/${encodeURIComponent(projectId)}/landing-pages`
    )
  },

  linkLandingPage(projectId: string, body: LinkLandingPagePayload) {
    return apiPost<Record<string, unknown>>(
      `${PREFIX}/projects/${encodeURIComponent(projectId)}/landing-pages`,
      body
    )
  },

  unlinkLandingPage(projectId: string, pageId: string) {
    return apiDelete<void>(
      `${PREFIX}/projects/${encodeURIComponent(projectId)}/landing-pages/${encodeURIComponent(pageId)}`
    )
  },

  scanLandingPage(projectId: string, pageId: string, body?: ScanProjectPayload) {
    return apiPost<{ jobId: string; status: string }>(
      `${PREFIX}/projects/${encodeURIComponent(projectId)}/landing-pages/${encodeURIComponent(pageId)}/scan`,
      body ?? {}
    )
  },

  landingPageScores(projectId: string, pageId: string) {
    return apiGet<Record<string, unknown>>(
      `${PREFIX}/projects/${encodeURIComponent(projectId)}/landing-pages/${encodeURIComponent(pageId)}/scores`
    )
  },

  landingPageTasks(projectId: string, pageId: string) {
    return apiGet<Record<string, unknown>[]>(
      `${PREFIX}/projects/${encodeURIComponent(projectId)}/landing-pages/${encodeURIComponent(pageId)}/tasks`
    )
  },

  getJob(jobId: string) {
    return apiGet<NestJobDetails>(`${PREFIX}/jobs/${encodeURIComponent(jobId)}`)
  },

  getJobEvents(jobId: string) {
    return apiGet<Array<Record<string, unknown>>>(`${PREFIX}/jobs/${encodeURIComponent(jobId)}/events`)
  },

  listTasks(projectId: string) {
    return apiGet<SeoTaskDto[]>(`${PREFIX}/seo-projects/${encodeURIComponent(projectId)}/tasks`)
  },

  approveTask(taskId: string) {
    return apiPost<SeoTaskDto>(`${PREFIX}/seo-tasks/${encodeURIComponent(taskId)}/approve`, {})
  },

  rejectTask(taskId: string) {
    return apiPost<SeoTaskDto>(`${PREFIX}/seo-tasks/${encodeURIComponent(taskId)}/reject`, {})
  },

  deployTask(taskId: string) {
    return apiPost<SeoTaskDto>(`${PREFIX}/seo-tasks/${encodeURIComponent(taskId)}/deploy`, {})
  },

  updateTask(taskId: string, body: { status: 'todo' | 'in_progress' | 'completed' }) {
    return apiPatch<SeoTaskDto>(`${PREFIX}/seo-tasks/${encodeURIComponent(taskId)}`, body)
  },

  setupSeoProject(id: string, body?: Record<string, unknown>) {
    return apiPost<SeoProjectDto>(`${PREFIX}/seo-projects/${encodeURIComponent(id)}/setup`, body ?? {})
  },

  getInstallation(id: string) {
    return apiGet<{ projectId: string; pixelTagState: string; script: string; status?: string }>(
      `${PREFIX}/seo-projects/${encodeURIComponent(id)}/installation`
    )
  },

  checkInstallation(id: string) {
    return apiPost<{ projectId: string; installed: boolean; pixelTagState: string }>(
      `${PREFIX}/seo-projects/${encodeURIComponent(id)}/installation/check`,
      {}
    )
  },

  getGscConnectUrl(projectId: string) {
    return apiGet<{ url: string; provider?: string; projectId?: string }>(
      `${PREFIX}/integrations/google/gsc/connect-url`,
      { params: { projectId } }
    )
  },

  getGbpConnectUrl(projectId: string) {
    return apiGet<{ url: string; provider?: string; projectId?: string }>(
      `${PREFIX}/integrations/google/gbp/connect-url`,
      { params: { projectId } }
    )
  },

  listWebsiteProjects() {
    return apiGet<Record<string, unknown>[]>(`${PREFIX}/website-projects`)
  },

  listWebsitePages(websiteProjectId: string) {
    return apiGet<Record<string, unknown>[]>(
      `${PREFIX}/website-projects/${encodeURIComponent(websiteProjectId)}/pages`
    )
  },

  publishWebsitePage(websiteProjectId: string, pageId: string) {
    return apiPost<Record<string, unknown>>(
      `${PREFIX}/website-projects/${encodeURIComponent(websiteProjectId)}/pages/${encodeURIComponent(pageId)}/publish`,
      {}
    )
  },

  connectWebsitePageToAiSeo(websiteProjectId: string, pageId: string, aiSeoProjectId: string) {
    return apiPost<Record<string, unknown>>(
      `${PREFIX}/website-projects/${encodeURIComponent(websiteProjectId)}/pages/${encodeURIComponent(pageId)}/connect-ai-seo`,
      { aiSeoProjectId }
    )
  },

  listAgents() {
    return apiGet<Record<string, unknown>[]>(`${PREFIX}/agents`)
  },

  researchKeywords(body: KeywordResearchPayload) {
    return apiPost<Record<string, unknown>>(`${PREFIX}/keywords/research`, body)
  },
}