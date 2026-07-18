import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { mapNestJobToFeJob, type FeJobDetails } from '@/lib/mappers/ai-seo.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import { bffHeaders, bffJson } from './bff-client'

export type JobEventItem = {
  id?: string
  message?: string
  [key: string]: unknown
}

export async function fetchJobDetails(jobId: string, orgId = 'org-1'): Promise<FeJobDetails> {
  if (isAiSeoNestApi()) {
    const job = await aiSeoApi.getJob(jobId)
    return mapNestJobToFeJob(job)
  }
  return bffJson(`/api/ai-seo/jobs/${jobId}`, { headers: bffHeaders(orgId) })
}

export async function fetchJobEvents(jobId: string, orgId = 'org-1'): Promise<JobEventItem[]> {
  if (isAiSeoNestApi()) {
    return aiSeoApi.getJobEvents(jobId)
  }
  return bffJson(`/api/ai-seo/jobs/${jobId}/events`, { headers: bffHeaders(orgId) })
}