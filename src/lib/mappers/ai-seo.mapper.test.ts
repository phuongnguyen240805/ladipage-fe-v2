import { describe, expect, it } from 'vitest'

import type { SeoProjectDto } from '@liora/api-types'

import {
  mapJobStatus,
  mapNestJobToFeJob,
  mapSeoProjectDtoToListItem,
} from './ai-seo.mapper'

const sampleProject: SeoProjectDto = {
  id: 'p-1',
  uuid: 'p-1',
  projectId: 'p-1',
  hostname: 'example.com',
  name: 'Example',
  slug: 'example-com',
  status: 'active',
  taskStatus: 'pending',
  pixelTagState: 'not_installed',
  isFavorite: false,
  isEngaged: true,
  isFrozen: false,
  holisticScores: {
    technicalsScore: 80,
    uxScore: 70,
    authorityScore: 60,
    contentScore: 90,
  },
  connectedData: {
    isGscConnected: true,
    isGbpConnected: false,
    gscDetails: {},
    gbpDetailsV2: {},
  },
  afterSummary: { healthyPages: 1, totalPages: 2 },
  aiGradeOverall: 75,
  siteAudit: {},
  readyForProcessing: true,
  isFirstProcessing: true,
  timeSavedTotal: 0,
  atRiskOfWipe: false,
  daysUntilWipe: null,
  wipeScheduledAt: null,
  lastAnalysis: null,
  nextAnalysisAt: null,
  createdAt: '2026-07-02T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
}

describe('ai-seo.mapper', () => {
  it('maps SeoProjectDto to AiSeoProjectListItem for dashboard cards', () => {
    const item = mapSeoProjectDtoToListItem(sampleProject)
    expect(item.agentStatus).toBe('engaged')
    expect(item.domain).toBe('example.com')
    expect(item.gscConnected).toBe(true)
    expect(item.scores.graderScore).toBe(75)
    expect(item.scores.technicalScore).toBe(80)
  })

  it('normalizes OpenSEO job statuses for polling', () => {
    expect(mapJobStatus('done')).toBe('success')
    expect(mapJobStatus('running')).toBe('running')
    expect(mapJobStatus('failed')).toBe('failed')
  })

  it('maps Nest job payload to FE job shape', () => {
    const job = mapNestJobToFeJob({
      jobId: 'job-1',
      projectId: 'p-1',
      status: 'completed',
      progress: 100,
      result: {},
    })
    expect(job.id).toBe('job-1')
    expect(job.status).toBe('success')
  })
})