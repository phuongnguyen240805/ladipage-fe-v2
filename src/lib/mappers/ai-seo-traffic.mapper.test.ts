import { describe, expect, it } from 'vitest'

import type { SeoTrafficEnvelopeDto, SeoTrafficStatsDto } from '@liora/api-types'

import {
  mapTrafficEnvelopeToCard,
  nestTrafficDisabledLocal,
} from './ai-seo-traffic.mapper'

describe('ai-seo-traffic.mapper', () => {
  it('maps ok envelope with stats', () => {
    const envelope: SeoTrafficEnvelopeDto<SeoTrafficStatsDto | null> = {
      status: 'ok',
      stale: false,
      syncedAt: '2026-07-16T00:00:00.000Z',
      range: { start: 'a', end: 'b' },
      data: {
        pageviews: 1200,
        visitors: 400,
        visits: 500,
        bounces: 10,
        totaltime: 1000,
      },
    }
    const card = mapTrafficEnvelopeToCard(envelope)
    expect(card.status).toBe('ok')
    expect(card.pageviews).toBe(1200)
    expect(card.visitors).toBe(400)
    expect(card.stale).toBe(false)
  })

  it('maps degraded with null data', () => {
    const card = mapTrafficEnvelopeToCard({
      status: 'degraded',
      stale: true,
      syncedAt: null,
      range: null,
      data: null,
      message: 'Umami down',
    })
    expect(card.status).toBe('degraded')
    expect(card.pageviews).toBeNull()
    expect(card.message).toBe('Umami down')
    expect(card.stale).toBe(true)
  })

  it('nestTrafficDisabledLocal returns disabled envelope', () => {
    const local = nestTrafficDisabledLocal('off')
    expect(local.status).toBe('disabled')
    expect(local.data).toBeNull()
    expect(local.message).toBe('off')
  })
})
