import { apiGet, apiPost } from '../api-client'
import type {
  CreateLandingAiJobPayload,
  LandingAiJobCreated,
  LandingAiJobDetails,
  LandingAiJobEvent,
  LandingAiQuota,
} from '@/features/landing-ai/types'

const PREFIX = '/landing-ai'

export const landingAiApi = {
  createJob(body: CreateLandingAiJobPayload) {
    return apiPost<LandingAiJobCreated>(`${PREFIX}/jobs`, body)
  },

  getJob(jobId: string) {
    return apiGet<LandingAiJobDetails>(`${PREFIX}/jobs/${encodeURIComponent(jobId)}`)
  },

  getJobEvents(jobId: string) {
    return apiGet<LandingAiJobEvent[]>(
      `${PREFIX}/jobs/${encodeURIComponent(jobId)}/events`,
    )
  },

  cancelJob(jobId: string) {
    return apiPost<{ jobId: string; status: string }>(
      `${PREFIX}/jobs/${encodeURIComponent(jobId)}/cancel`,
    )
  },

  getQuota() {
    return apiGet<LandingAiQuota>(`${PREFIX}/quota`)
  },
}