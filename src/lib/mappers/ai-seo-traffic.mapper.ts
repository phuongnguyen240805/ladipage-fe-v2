import type {
  SeoTrafficEnvelopeDto,
  SeoTrafficStatsDto,
  SeoTrafficStatus,
} from '@liora/api-types'

export type FeTrafficCardModel = {
  status: SeoTrafficStatus
  stale: boolean
  message?: string
  pageviews: number | null
  visitors: number | null
  visits: number | null
  bounces: number | null
  syncedAt: string | null
}

const EMPTY: FeTrafficCardModel = {
  status: 'disabled',
  stale: false,
  pageviews: null,
  visitors: null,
  visits: null,
  bounces: null,
  syncedAt: null,
}

export function mapTrafficEnvelopeToCard(
  envelope: SeoTrafficEnvelopeDto<SeoTrafficStatsDto | null> | null | undefined
): FeTrafficCardModel {
  if (!envelope) return { ...EMPTY }

  const stats = envelope.data
  const hasStats = stats != null && typeof stats === 'object'

  return {
    status: envelope.status,
    stale: Boolean(envelope.stale),
    message: envelope.message,
    pageviews: hasStats ? num(stats.pageviews) : null,
    visitors: hasStats ? num(stats.visitors) : null,
    visits: hasStats ? num(stats.visits) : null,
    bounces: hasStats ? num(stats.bounces) : null,
    syncedAt: envelope.syncedAt,
  }
}

export function nestTrafficDisabledLocal(
  message = 'Bật NEXT_PUBLIC_AI_SEO_USE_NEST=true để tải traffic từ Nest'
): SeoTrafficEnvelopeDto<SeoTrafficStatsDto | null> {
  return {
    status: 'disabled',
    stale: false,
    syncedAt: null,
    range: null,
    data: null,
    message,
  }
}

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
