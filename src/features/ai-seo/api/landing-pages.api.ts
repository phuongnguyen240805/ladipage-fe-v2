import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import {
  mapNestLandingPage,
  mapNestPageScore,
  mapNestPageTask,
} from '@/lib/mappers/ai-seo.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import type {
  AiSeoPageScore,
  AiSeoPageTask,
  AiSeoProjectPage,
  WebsitePage,
  WebsiteProject,
} from '../types'
import { bffHeaders, bffJson } from './bff-client'

export async function fetchConnectedLandingPages(
  orgId: string,
  projectId: string
): Promise<AiSeoProjectPage[]> {
  if (isAiSeoNestApi()) {
    const pages = await aiSeoApi.listLandingPages(projectId)
    return pages.map((page) => mapNestLandingPage(page))
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/landing-pages`, {
    headers: bffHeaders(orgId),
  })
}

export async function linkLandingPage(
  orgId: string,
  projectId: string,
  pageUrl: string,
  websitePageId?: string | null,
  source: 'internal' | 'external' = 'external'
): Promise<AiSeoProjectPage> {
  if (isAiSeoNestApi()) {
    const page = await aiSeoApi.linkLandingPage(projectId, {
      pageUrl,
      websitePageId: websitePageId ?? undefined,
      source,
    })
    return mapNestLandingPage(page)
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/landing-pages`, {
    method: 'POST',
    headers: bffHeaders(orgId),
    body: JSON.stringify({ pageUrl, websitePageId, source }),
  })
}

export async function unlinkLandingPage(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<void> {
  if (isAiSeoNestApi()) {
    await aiSeoApi.unlinkLandingPage(projectId, pageId)
    return
  }
  await bffJson(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}`, {
    method: 'DELETE',
    headers: bffHeaders(orgId),
  })
}

export async function scanLandingPage(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<{ jobId: string; status: string }> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.scanLandingPage(projectId, pageId)
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}/scan`, {
    method: 'POST',
    headers: bffHeaders(orgId),
  })
}

export async function fetchLandingPageScores(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<AiSeoPageScore> {
  if (isAiSeoNestApi()) {
    const scores = await aiSeoApi.landingPageScores(projectId, pageId)
    return mapNestPageScore(scores)
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}/scores`, {
    headers: bffHeaders(orgId),
  })
}

export async function fetchLandingPageTasks(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<AiSeoPageTask[]> {
  if (isAiSeoNestApi()) {
    const tasks = await aiSeoApi.landingPageTasks(projectId, pageId)
    return tasks.map((task) => mapNestPageTask(task))
  }
  return bffJson(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}/tasks`, {
    headers: bffHeaders(orgId),
  })
}

export async function fetchWebsiteProjects(orgId: string): Promise<WebsiteProject[]> {
  if (isAiSeoNestApi()) {
    const projects = await aiSeoApi.listWebsiteProjects()
    return projects as unknown as WebsiteProject[]
  }
  return bffJson('/api/ai-seo/website-projects', { headers: bffHeaders(orgId) })
}

export async function fetchWebsitePages(
  orgId: string,
  websiteProjectId: string
): Promise<WebsitePage[]> {
  if (isAiSeoNestApi()) {
    const pages = await aiSeoApi.listWebsitePages(websiteProjectId)
    return pages as unknown as WebsitePage[]
  }
  return bffJson(`/api/ai-seo/website-projects/${websiteProjectId}/pages`, {
    headers: bffHeaders(orgId),
  })
}

export async function publishWebsitePage(
  orgId: string,
  websiteProjectId: string,
  pageId: string
): Promise<WebsitePage> {
  if (isAiSeoNestApi()) {
    const page = await aiSeoApi.publishWebsitePage(websiteProjectId, pageId)
    return page as unknown as WebsitePage
  }
  return bffJson(
    `/api/ai-seo/website-projects/${websiteProjectId}/pages/${pageId}/publish`,
    { method: 'POST', headers: bffHeaders(orgId) }
  )
}

export async function connectWebsitePageToAiSeo(
  orgId: string,
  websiteProjectId: string,
  pageId: string,
  aiSeoProjectId: string
): Promise<AiSeoProjectPage> {
  if (isAiSeoNestApi()) {
    const page = await aiSeoApi.connectWebsitePageToAiSeo(
      websiteProjectId,
      pageId,
      aiSeoProjectId
    )
    return mapNestLandingPage(page)
  }
  return bffJson(
    `/api/ai-seo/website-projects/${websiteProjectId}/pages/${pageId}/connect-ai-seo`,
    {
      method: 'POST',
      headers: bffHeaders(orgId),
      body: JSON.stringify({ aiSeoProjectId }),
    }
  )
}