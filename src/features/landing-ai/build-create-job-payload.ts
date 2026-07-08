import type { CreateLandingAiJobPayload, LandingAiJobType } from './types'

type GeneratorParams = {
  businessName?: string
  campaignId?: string
  cloneMode?: string
  cta?: string
  goal?: string
  industry?: string
  keyword?: string
  location?: string
  offer?: string
  prompt?: string
  source?: string
  style?: string
  url?: string
}

export function buildLandingAiCreateJobPayload(input: {
  type: LandingAiJobType
  name: string
  tagIds: string[]
  params: GeneratorParams
}): CreateLandingAiJobPayload {
  const { type, name, tagIds, params } = input

  if (type === 'ai') {
    return {
      type,
      name,
      tagIds,
      importMode: 'preserve',
      params: {
        businessName: params.businessName,
        industry: params.industry,
        location: params.location,
        goal: params.goal,
        style: params.style,
        prompt: params.prompt,
      },
    }
  }

  if (type === 'clone') {
    return {
      type,
      name,
      tagIds,
      importMode: 'preserve',
      params: {
        url: params.url,
        cloneMode: params.cloneMode,
        keyword: params.keyword,
      },
    }
  }

  return {
    type: 'ppc',
    name,
    tagIds,
    importMode: 'preserve',
    params: {
      source: params.source,
      campaignId: params.campaignId,
      keyword: params.keyword,
      goal: params.goal,
      offer: params.offer,
      cta: params.cta,
    },
  }
}