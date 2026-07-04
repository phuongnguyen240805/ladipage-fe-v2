import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { mapSeoTaskDtosToFeTasks } from '@/lib/mappers/ai-seo.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import type { SeoTask } from '../types'
import { bffHeaders, bffJson } from './bff-client'

export async function fetchSeoTasks(
  orgId: string,
  seoProjectId: string
): Promise<SeoTask[]> {
  if (isAiSeoNestApi()) {
    const tasks = await aiSeoApi.listTasks(seoProjectId)
    return mapSeoTaskDtosToFeTasks(tasks)
  }
  return bffJson(`/api/ai-seo/seo-projects/${seoProjectId}/tasks`, {
    headers: bffHeaders(orgId),
  })
}

export async function updateSeoTask(
  orgId: string,
  taskId: string,
  status: 'todo' | 'in_progress' | 'completed'
): Promise<SeoTask> {
  if (isAiSeoNestApi()) {
    const task = await aiSeoApi.updateTask(taskId, { status })
    return mapSeoTaskDtosToFeTasks([task])[0]
  }
  return bffJson(`/api/ai-seo/seo-tasks/${taskId}`, {
    method: 'PATCH',
    headers: bffHeaders(orgId),
    body: JSON.stringify({ status }),
  })
}

export async function approveSeoTask(orgId: string, taskId: string): Promise<SeoTask> {
  if (isAiSeoNestApi()) {
    const task = await aiSeoApi.approveTask(taskId)
    return mapSeoTaskDtosToFeTasks([task])[0]
  }
  return bffJson(`/api/ai-seo/seo-tasks/${taskId}/approve`, {
    method: 'POST',
    headers: bffHeaders(orgId),
  })
}

export async function rejectSeoTask(orgId: string, taskId: string): Promise<SeoTask> {
  if (isAiSeoNestApi()) {
    const task = await aiSeoApi.rejectTask(taskId)
    return mapSeoTaskDtosToFeTasks([task])[0]
  }
  return bffJson(`/api/ai-seo/seo-tasks/${taskId}/reject`, {
    method: 'POST',
    headers: bffHeaders(orgId),
  })
}

export async function deploySeoTask(orgId: string, taskId: string): Promise<SeoTask> {
  if (isAiSeoNestApi()) {
    const task = await aiSeoApi.deployTask(taskId)
    return mapSeoTaskDtosToFeTasks([task])[0]
  }
  return bffJson(`/api/ai-seo/seo-tasks/${taskId}/deploy`, {
    method: 'POST',
    headers: bffHeaders(orgId),
  })
}