import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'

import { isAiSeoNestApi } from '../utils/ai-seo-api-mode'
import { bffHeaders, bffJson } from './bff-client'

export async function fetchGscConnectUrl(
  projectId: string,
  orgId = 'org-1'
): Promise<{ url: string }> {
  if (isAiSeoNestApi()) {
    const result = await aiSeoApi.getGscConnectUrl(projectId)
    return { url: result.url }
  }
  return bffJson(
    `/api/ai-seo/integrations/google/gsc/connect-url?projectId=${encodeURIComponent(projectId)}`,
    { headers: bffHeaders(orgId) }
  )
}

export async function fetchGbpConnectUrl(
  projectId: string,
  orgId = 'org-1'
): Promise<{ url: string }> {
  if (isAiSeoNestApi()) {
    const result = await aiSeoApi.getGbpConnectUrl(projectId)
    return { url: result.url }
  }
  return bffJson(
    `/api/ai-seo/integrations/google/gbp/connect-url?projectId=${encodeURIComponent(projectId)}`,
    { headers: bffHeaders(orgId) }
  )
}