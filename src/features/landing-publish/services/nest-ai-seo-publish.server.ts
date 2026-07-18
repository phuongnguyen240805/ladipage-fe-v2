/**
 * Fail-soft Nest AI-SEO + Umami sync after L1 publish.
 * Design (publish → Nest completeLandingPublish):
 *   ensure SEO project → auto-link page → Umami provision → inject scripts
 * Never throws — publish must succeed even when Nest/OpenSEO/Umami is down.
 */

export type NestAiSeoSyncResult = {
  pageId: string
  publicUrl: string | null
  html: string | null
  seoProjectId: string | null
  seoSyncStatus: string
  trafficSyncStatus: string
  scriptsInjected: { seoPixel: boolean; umami: boolean }
  autoLinked: boolean
  published: boolean
  message?: string
}

export type NestAiSeoSyncInput = {
  pageId: string
  html: string | null
  publicUrl: string | null
  name: string
  slug: string
  /** Bearer Nest JWT for TenantGuard; skip when missing */
  authHeader?: string | null
}

function nestApiBase(): string {
  const base =
    process.env.NEST_INTERNAL_API_URL?.trim() ||
    process.env.LADIPAGE_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:7002/api"
  return base.replace(/\/$/, "")
}

/** Extract hostname from absolute URL (best-effort). */
export function hostnameFromPublicUrl(publicUrl: string | null | undefined): string | null {
  if (!publicUrl?.trim()) return null
  try {
    const withProtocol = /^https?:\/\//i.test(publicUrl) ? publicUrl : `https://${publicUrl}`
    const host = new URL(withProtocol).hostname.replace(/^www\./i, "").toLowerCase()
    return host || null
  } catch {
    return null
  }
}

/**
 * Hostname for Nest SEO project row.
 * Prefer public host from publicUrl; when only /p/slug on localhost, use stable slug host
 * so auto-create still works (OpenSEO scan still requires a real domain later).
 */
export function resolveSeoHostnameForPublish(input: {
  publicUrl: string | null | undefined
  slug: string
}): string {
  const fromUrl = hostnameFromPublicUrl(input.publicUrl)
  if (
    fromUrl &&
    fromUrl !== "localhost" &&
    fromUrl !== "127.0.0.1" &&
    !fromUrl.endsWith(".localhost")
  ) {
    return fromUrl
  }
  const slug = (input.slug || "page")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
  return `${slug || "page"}.landing.local`
}

function unwrapNestData<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") return null
  const record = body as Record<string, unknown>
  if ("data" in record && record.data != null && typeof record.data === "object") {
    return record.data as T
  }
  return body as T
}

/**
 * POST Nest /publish/landing-pages/:pageId/ai-seo-sync
 * Returns null on skip/failure (fail-soft).
 */
export async function syncNestAiSeoAfterPublish(
  input: NestAiSeoSyncInput,
): Promise<NestAiSeoSyncResult | null> {
  if (!input.authHeader?.trim()) {
    console.warn(
      `NestAiSeoPublish: skip page=${input.pageId} — missing Nest JWT (login workspace / preferNest)`,
    )
    return null
  }

  const hostname = resolveSeoHostnameForPublish({
    publicUrl: input.publicUrl,
    slug: input.slug,
  })
  const auth = input.authHeader.startsWith("Bearer ")
    ? input.authHeader
    : `Bearer ${input.authHeader}`
  const url = `${nestApiBase()}/publish/landing-pages/${encodeURIComponent(input.pageId)}/ai-seo-sync`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        html: input.html,
        publicUrl: input.publicUrl,
        hostname,
        name: input.name || input.slug || hostname,
        slug: input.slug,
        ensureSeoProject: true,
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.warn(
        `NestAiSeoPublish: HTTP ${res.status} page=${input.pageId}: ${text.slice(0, 240)}`,
      )
      return null
    }

    const data = unwrapNestData<NestAiSeoSyncResult>(await res.json().catch(() => null))
    if (!data || typeof data !== "object") {
      console.warn(`NestAiSeoPublish: bad response page=${input.pageId}`)
      return null
    }
    return data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`NestAiSeoPublish: soft-fail page=${input.pageId}: ${message}`)
    return null
  }
}
