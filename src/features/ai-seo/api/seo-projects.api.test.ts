import { beforeEach, describe, expect, it, vi } from 'vitest'

const createProject = vi.fn()
const setupSeoProjectNest = vi.fn()

vi.mock('@/lib/endpoints/ai-seo.api', () => ({
  aiSeoApi: {
    createProject: (...args: unknown[]) => createProject(...args),
    setupSeoProject: (...args: unknown[]) => setupSeoProjectNest(...args),
    listProjects: vi.fn(),
    scanProject: vi.fn(),
    checkInstallation: vi.fn(),
  },
}))

vi.mock('../utils/ai-seo-api-mode', () => ({
  isAiSeoNestApi: vi.fn(),
}))

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import { createSeoProjectFromWizard, setupSeoProject } from './seo-projects.api'

describe('seo-projects.api wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createSeoProjectFromWizard uses Nest hostname payload when flag on', async () => {
    vi.mocked(isAiSeoNestApi).mockReturnValue(true)
    createProject.mockResolvedValue({
      id: 'seo-1',
      uuid: 'seo-1',
      projectId: 'seo-1',
      hostname: 'example.com',
      name: 'My Project',
      slug: 'example-com',
      status: 'active',
      taskStatus: 'pending',
      pixelTagState: 'not_installed',
      isFavorite: false,
      isEngaged: true,
      isFrozen: false,
      holisticScores: {
        technicalsScore: 0,
        uxScore: 0,
        authorityScore: 0,
        contentScore: 0,
      },
      connectedData: {
        isGscConnected: false,
        isGbpConnected: false,
        gscDetails: {},
        gbpDetailsV2: {},
      },
      afterSummary: { healthyPages: 0, totalPages: 0 },
      aiGradeOverall: 0,
      siteAudit: {},
      readyForProcessing: true,
      isFirstProcessing: true,
      timeSavedTotal: 0,
      atRiskOfWipe: false,
      daysUntilWipe: null,
      wipeScheduledAt: null,
      lastAnalysis: null,
      nextAnalysisAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const result = await createSeoProjectFromWizard('org-1', {
      websiteUrl: 'https://example.com/path',
      projectName: 'My Project',
    })

    expect(createProject).toHaveBeenCalledWith({
      hostname: 'example.com',
      name: 'My Project',
    })
    expect(result.id).toBe('seo-1')
  })

  it('setupSeoProject uses Nest when flag on', async () => {
    vi.mocked(isAiSeoNestApi).mockReturnValue(true)
    setupSeoProjectNest.mockResolvedValue({
      id: 'seo-1',
      uuid: 'seo-1',
      projectId: 'seo-1',
      hostname: 'example.com',
      name: 'My Project',
      slug: 'example-com',
      status: 'active',
      taskStatus: 'pending',
      pixelTagState: 'not_installed',
      isFavorite: false,
      isEngaged: true,
      isFrozen: false,
      holisticScores: {
        technicalsScore: 0,
        uxScore: 0,
        authorityScore: 0,
        contentScore: 0,
      },
      connectedData: {
        isGscConnected: false,
        isGbpConnected: false,
        gscDetails: {},
        gbpDetailsV2: {},
      },
      afterSummary: { healthyPages: 0, totalPages: 0 },
      aiGradeOverall: 0,
      siteAudit: { businessProfile: { businessName: 'Acme' } },
      readyForProcessing: true,
      isFirstProcessing: true,
      timeSavedTotal: 0,
      atRiskOfWipe: false,
      daysUntilWipe: null,
      wipeScheduledAt: null,
      lastAnalysis: null,
      nextAnalysisAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    await setupSeoProject('org-1', 'seo-1', { businessName: 'Acme' })
    expect(setupSeoProjectNest).toHaveBeenCalledWith('seo-1', { businessName: 'Acme' })
  })
})
