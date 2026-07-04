/** When true, AI-SEO feature APIs call Nest `/ai-seo/*` via api-client instead of Next BFF. */
export function isAiSeoNestApi(): boolean {
  return process.env.NEXT_PUBLIC_AI_SEO_USE_NEST === 'true'
}

/** Chat/conversations still use BFF until BE module exists. */
export function isAiSeoChatBffOnly(): boolean {
  return process.env.NEXT_PUBLIC_AI_SEO_CHAT_USE_BFF !== 'false'
}