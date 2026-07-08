export type LandingAiJobType = 'ai' | 'clone' | 'ppc'

export type LandingAiJobStatus =
  | 'queued'
  | 'running'
  | 'success'
  | 'failed'
  | 'cancelled'

export interface LandingAiJobParams {
  businessName?: string
  industry?: string
  location?: string
  goal?: string
  style?: string
  prompt?: string
  url?: string
  cloneMode?: string
  keyword?: string
  source?: string
  campaignId?: string
  offer?: string
  cta?: string
}

export interface CreateLandingAiJobPayload {
  type: LandingAiJobType
  name: string
  tagIds?: string[]
  importMode?: 'preserve' | 'convert'
  params: LandingAiJobParams
}

export interface LandingAiJobCreated {
  jobId: string
  pageId: string
  status: string
}

export interface LandingAiJobDetails {
  jobId: string
  pageId: string
  type: LandingAiJobType
  status: LandingAiJobStatus
  progress: number
  result?: {
    pageId?: string
    slug?: string
    htmlLength?: number
    importMode?: string
    mock?: boolean
  }
  error?: string
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface LandingAiJobEvent {
  id: string
  message: string
  progress?: number | null
  createdAt: string
}

export interface LandingAiQuota {
  used: number
  reserved: number
  limit: number
  remaining: number
}