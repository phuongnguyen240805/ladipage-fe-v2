import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { mapSeoProjectDtoToListItem, mapSeoProjectDtosToListItems } from '@/lib/mappers/ai-seo.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import type { AiSeoProjectListItem } from '../types'
import { bffHeaders, bffJson } from './bff-client'

export async function fetchAiSeoProjects(_orgId = 'org-1'): Promise<AiSeoProjectListItem[]> {
  if (isAiSeoNestApi()) {
    const projects = await aiSeoApi.listProjects()
    return mapSeoProjectDtosToListItems(projects)
  }
  return bffJson<AiSeoProjectListItem[]>('/api/ai-seo/projects', { headers: bffHeaders(_orgId) })
}

export async function createAiSeoProject(
  data: { name: string; hostname: string },
  _orgId = 'org-1'
): Promise<AiSeoProjectListItem> {
  if (isAiSeoNestApi()) {
    const project = await aiSeoApi.createProject(data)
    return mapSeoProjectDtoToListItem(project)
  }
  return bffJson('/api/ai-seo/projects', {
    method: 'POST',
    headers: bffHeaders(_orgId),
    body: JSON.stringify(data),
  })
}

export async function toggleFavoriteProject(
  projectId: string,
  _orgId = 'org-1'
): Promise<{ id: string; projectId: string; isFavorite: boolean }> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.toggleFavorite(projectId)
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/favorite`, {
    method: 'PATCH',
    headers: bffHeaders(_orgId),
  })
}

export async function toggleAgentStatus(
  projectId: string,
  _orgId = 'org-1'
): Promise<{ id: string; projectId: string; isEngaged: boolean }> {
  if (isAiSeoNestApi()) {
    const result = await aiSeoApi.toggleAgent(projectId)
    return { id: result.id, projectId: result.projectId, isEngaged: result.isEngaged }
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/agent-status`, {
    method: 'PATCH',
    headers: bffHeaders(_orgId),
  })
}

export async function triggerProjectScan(
  projectId: string,
  _orgId = 'org-1'
): Promise<{ jobId: string; status: string }> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.scanProject(projectId)
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/scan`, {
    method: 'POST',
    headers: bffHeaders(_orgId),
  })
}

export async function deleteProject(
  projectId: string,
  _orgId = 'org-1'
): Promise<{ success: boolean }> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.deleteProject(projectId)
  }
  await bffJson(`/api/ai-seo/projects/${projectId}`, {
    method: 'DELETE',
    headers: bffHeaders(_orgId),
  })
  return { success: true }
}