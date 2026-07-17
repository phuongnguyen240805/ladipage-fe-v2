import type {
  SeoTrafficEnvelopeDto,
  SeoTrafficHealthDto,
  SeoTrafficMetricRowDto,
  SeoTrafficMetricType,
  SeoTrafficProvisionDto,
  SeoTrafficRange,
  SeoTrafficStatsDto,
} from '@liora/api-types'

import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'
import { nestTrafficDisabledLocal } from '@/lib/mappers/ai-seo-traffic.mapper'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'

/**
 * Traffic only via Nest adapter (Umami never called from browser).
 * When Nest flag is off, return local disabled envelope — no network.
 */
export async function fetchProjectTraffic(
  projectId: string,
  range: SeoTrafficRange = '7d'
): Promise<SeoTrafficEnvelopeDto<SeoTrafficStatsDto | null>> {
  if (!isAiSeoNestApi()) {
    return nestTrafficDisabledLocal()
  }
  return aiSeoApi.getProjectTraffic(projectId, range)
}

export async function fetchProjectTrafficMetrics(
  projectId: string,
  type: SeoTrafficMetricType = 'referrer',
  range: SeoTrafficRange = '7d'
): Promise<SeoTrafficEnvelopeDto<SeoTrafficMetricRowDto[] | null>> {
  if (!isAiSeoNestApi()) {
    return nestTrafficDisabledLocal() as SeoTrafficEnvelopeDto<SeoTrafficMetricRowDto[] | null>
  }
  return aiSeoApi.getProjectTrafficMetrics(projectId, type, range)
}

export async function fetchTrafficHealth(): Promise<SeoTrafficHealthDto> {
  if (!isAiSeoNestApi()) {
    return { ok: false, enabled: false, circuit: 'closed' }
  }
  return aiSeoApi.trafficHealth()
}

export async function provisionProjectTraffic(
  projectId: string
): Promise<SeoTrafficProvisionDto> {
  if (!isAiSeoNestApi()) {
    return {
      status: 'disabled',
      umamiWebsiteId: null,
      message: 'Nest AI-SEO API is disabled on FE',
    }
  }
  return aiSeoApi.provisionProjectTraffic(projectId)
}
