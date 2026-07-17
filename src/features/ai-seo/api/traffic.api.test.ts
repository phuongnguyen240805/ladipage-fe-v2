import { beforeEach, describe, expect, it, vi } from 'vitest'

const getProjectTraffic = vi.fn()
const trafficHealth = vi.fn()

vi.mock('@/lib/endpoints/ai-seo.api', () => ({
  aiSeoApi: {
    getProjectTraffic: (...args: unknown[]) => getProjectTraffic(...args),
    trafficHealth: (...args: unknown[]) => trafficHealth(...args),
    provisionProjectTraffic: vi.fn(),
    getProjectTrafficMetrics: vi.fn(),
  },
}))

vi.mock('../utils/ai-seo-api-mode', () => ({
  isAiSeoNestApi: vi.fn(),
}))

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import { fetchProjectTraffic, fetchTrafficHealth } from './traffic.api'

describe('traffic.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not call Nest when flag is off', async () => {
    vi.mocked(isAiSeoNestApi).mockReturnValue(false)
    const result = await fetchProjectTraffic('p1')
    expect(result.status).toBe('disabled')
    expect(getProjectTraffic).not.toHaveBeenCalled()
  })

  it('calls Nest getProjectTraffic when flag is on', async () => {
    vi.mocked(isAiSeoNestApi).mockReturnValue(true)
    getProjectTraffic.mockResolvedValue({
      status: 'ok',
      stale: false,
      syncedAt: null,
      range: null,
      data: { pageviews: 1, visitors: 1, visits: 1, bounces: 0, totaltime: 0 },
    })
    const result = await fetchProjectTraffic('p1', '30d')
    expect(getProjectTraffic).toHaveBeenCalledWith('p1', '30d')
    expect(result.status).toBe('ok')
  })

  it('traffic health short-circuits when Nest off', async () => {
    vi.mocked(isAiSeoNestApi).mockReturnValue(false)
    const health = await fetchTrafficHealth()
    expect(health.enabled).toBe(false)
    expect(trafficHealth).not.toHaveBeenCalled()
  })
})
