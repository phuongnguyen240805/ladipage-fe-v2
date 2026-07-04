import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { mapSeoProjectDtoToListItem, mapSeoProjectDtosToListItems } from '@/lib/mappers/ai-seo.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import type { AiSeoProjectListItem, Project } from '../types'
import { bffHeaders, bffJson } from './bff-client'

export async function fetchProjects(orgId: string): Promise<Project[] | AiSeoProjectListItem[]> {
  if (isAiSeoNestApi()) {
    const projects = await aiSeoApi.listProjects()
    return mapSeoProjectDtosToListItems(projects)
  }
  return bffJson(`/api/ai-seo/projects?orgId=${encodeURIComponent(orgId)}`, {
    headers: bffHeaders(orgId),
  })
}

export async function createProject(
  orgId: string,
  name: string,
  hostname?: string
): Promise<Project | AiSeoProjectListItem> {
  if (isAiSeoNestApi()) {
    const host = hostname ?? name
    const project = await aiSeoApi.createProject({ hostname: host, name })
    return mapSeoProjectDtoToListItem(project)
  }
  return bffJson('/api/ai-seo/projects', {
    method: 'POST',
    headers: bffHeaders(orgId),
    body: JSON.stringify({ name, hostname: hostname ?? name }),
  })
}

export async function updateProject(
  orgId: string,
  projectId: string,
  name: string
): Promise<Project | AiSeoProjectListItem> {
  if (isAiSeoNestApi()) {
    const project = await aiSeoApi.updateProject(projectId, { name })
    return mapSeoProjectDtoToListItem(project)
  }
  return bffJson(`/api/ai-seo/projects/${projectId}`, {
    method: 'PATCH',
    headers: bffHeaders(orgId),
    body: JSON.stringify({ name }),
  })
}

export async function deleteProject(orgId: string, projectId: string): Promise<void> {
  if (isAiSeoNestApi()) {
    await aiSeoApi.deleteProject(projectId)
    return
  }
  await bffJson(`/api/ai-seo/projects/${projectId}`, {
    method: 'DELETE',
    headers: bffHeaders(orgId),
  })
}