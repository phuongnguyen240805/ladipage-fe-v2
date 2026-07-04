import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { mapSeoProjectDtoToListItem, mapSeoProjectDtosToListItems } from '@/lib/mappers/ai-seo.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import type { AiSeoProjectListItem } from '../types'
import { bffHeaders, bffJson } from './bff-client'

export async function fetchSeoProjects(orgId: string): Promise<AiSeoProjectListItem[]> {
  if (isAiSeoNestApi()) {
    const projects = await aiSeoApi.listProjects()
    return mapSeoProjectDtosToListItems(projects)
  }
  return bffJson('/api/ai-seo/seo-projects', { headers: bffHeaders(orgId) })
}

export async function createSeoProject(
  orgId: string,
  _projectId: string,
  domain: string
): Promise<AiSeoProjectListItem> {
  if (isAiSeoNestApi()) {
    const project = await aiSeoApi.createProject({ hostname: domain, name: domain })
    return mapSeoProjectDtoToListItem(project)
  }
  return bffJson('/api/ai-seo/seo-projects', {
    method: 'POST',
    headers: bffHeaders(orgId),
    body: JSON.stringify({ projectId: _projectId, domain }),
  })
}

export async function startAudit(
  orgId: string,
  seoProjectId: string
): Promise<{ jobId: string; status: string }> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.scanProject(seoProjectId)
  }
  return bffJson(`/api/ai-seo/seo-projects/${seoProjectId}/start-audit`, {
    method: 'POST',
    headers: bffHeaders(orgId),
  })
}

export async function createSeoProjectFromWizard(
  orgId: string,
  data: {
    websiteUrl: string
    projectName: string
    countryCode?: string
    languageCode?: string
    crawlBudget?: number
    userAgent?: string
    crawlConcurrency?: number
    respectRobotsTxt?: boolean
    urlExclusionRules?: string[]
  }
): Promise<AiSeoProjectListItem> {
  let hostname = data.websiteUrl
  try {
    hostname = new URL(data.websiteUrl).hostname
  } catch {
    // keep raw value
  }

  if (isAiSeoNestApi()) {
    const project = await aiSeoApi.createProject({
      hostname,
      name: data.projectName,
    })
    return mapSeoProjectDtoToListItem(project)
  }

  return bffJson('/api/ai-seo/seo-projects', {
    method: 'POST',
    headers: bffHeaders(orgId),
    body: JSON.stringify(data),
  })
}

export async function setupSeoProject(
  orgId: string,
  seoProjectId: string,
  body: Record<string, unknown>
): Promise<AiSeoProjectListItem> {
  if (isAiSeoNestApi()) {
    const project = await aiSeoApi.setupSeoProject(seoProjectId, body)
    return mapSeoProjectDtoToListItem(project)
  }
  return bffJson(`/api/ai-seo/seo-projects/${seoProjectId}/setup`, {
    method: 'PATCH',
    headers: bffHeaders(orgId),
    body: JSON.stringify(body),
  })
}

export async function checkSeoInstallation(
  orgId: string,
  seoProjectId: string
): Promise<{ installed: boolean; pixelTagState: string; status?: string }> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.checkInstallation(seoProjectId)
  }
  await bffJson(`/api/ai-seo/seo-projects/${seoProjectId}/installation/check`, {
    method: 'POST',
    headers: bffHeaders(orgId),
  })
  const data = await bffJson<{ status?: string; pixelTagState?: string }>(
    `/api/ai-seo/seo-projects/${seoProjectId}/installation`,
    { headers: bffHeaders(orgId) }
  )
  return {
    installed: data.status === 'installed' || data.pixelTagState === 'installed',
    pixelTagState: data.pixelTagState ?? 'not_installed',
    status: data.status,
  }
}