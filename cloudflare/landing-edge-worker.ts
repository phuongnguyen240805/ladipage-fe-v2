import {
  buildCanonicalRouteKvKey,
  buildCustomDomainKvKey,
  resolveEdgeOriginPath,
  resolveFreeSubdomainOriginPath,
  resolveFreeSubdomainSlug,
  type LandingArtifactRoutePointer,
  type LandingEdgeRouteConfig,
  type LandingRoutesKvNamespace,
} from './landing-edge-worker.stub'

interface R2ObjectLike {
  body?: ReadableStream
  httpEtag?: string
  customMetadata?: Record<string, string>
  writeHttpMetadata?(headers: Headers): void
}

interface R2BucketLike {
  head(key: string): Promise<R2ObjectLike | null>
  get(key: string): Promise<R2ObjectLike | null>
  put(
    key: string,
    value: string,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string }
      customMetadata?: Record<string, string>
    },
  ): Promise<R2ObjectLike | null>
}

interface AnalyticsEngineLike {
  writeDataPoint(event: {
    indexes?: string[]
    blobs?: string[]
    doubles?: number[]
  }): void
}

interface LandingEdgeWorkerEnv {
  LANDING_ROUTES_KV: LandingRoutesKvNamespace
  LANDING_ARTIFACTS_R2: R2BucketLike
  LANDING_EDGE_ANALYTICS?: AnalyticsEngineLike
  LANDING_ORIGIN_BASE_URL: string
  FREE_SITE_DOMAIN?: string
  LANDING_EDGE_PUBLISH_SECRET?: string
  LANDING_EDGE_FALLBACK_ENABLED?: string
}

interface EdgeRouteInput {
  hostname: string
  path: string
  originSlug: string
  originBaseUrl: string
}

type AdminPayload =
  | {
      action: 'publish'
      pageId: string
      version: number
      html: string
      artifactHash?: string
      routes: EdgeRouteInput[]
    }
  | {
      action: 'activate'
      pageId: string
      version: number
      routes: EdgeRouteInput[]
    }
  | {
      action: 'unpublish'
      pageId: string
      routes: EdgeRouteInput[]
    }

const ADMIN_PATH = '/__landing-edge/admin'
const MAX_ADMIN_BODY_BYTES = 8 * 1024 * 1024
const MAX_ROUTES = 100
const SIGNATURE_MAX_SKEW_MS = 5 * 60_000
const HOST_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

function normalizeHost(value: string): string | null {
  const host = value.trim().toLowerCase().replace(/\.$/, '').split(':')[0] ?? ''
  return host && HOST_PATTERN.test(host) ? host : null
}

function normalizePath(value: string): string {
  let path = value.trim() || '/'
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  return path
}

function artifactKey(pageId: string, version: number): string {
  return `landing/${pageId}/${version}/index.html`
}

function recordEdgeMetric(
  env: LandingEdgeWorkerEnv,
  event: string,
  host: string,
  path: string,
  version = 0,
): void {
  try {
    env.LANDING_EDGE_ANALYTICS?.writeDataPoint({
      indexes: [host],
      blobs: [event, path],
      doubles: [version],
    })
  }
  catch {
    // Metrics must never affect public delivery.
  }
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (part) => part.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(value: string): Uint8Array | null {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null
  const bytes = new Uint8Array(32)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function verifyAdminSignature(request: Request, secret: string): Promise<{ ok: boolean; text: string }> {
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_ADMIN_BODY_BYTES) return { ok: false, text }

  const timestamp = request.headers.get('x-liora-edge-timestamp') ?? ''
  const signature = request.headers.get('x-liora-edge-signature') ?? ''
  const timestampMs = Number(timestamp)
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > SIGNATURE_MAX_SKEW_MS) {
    return { ok: false, text }
  }
  const provided = hexToBytes(signature)
  if (!provided) return { ok: false, text }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const expected = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${text}`)),
  )
  if (expected.length !== provided.length) return { ok: false, text }

  let mismatch = 0
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected[i] ^ provided[i]
  return { ok: mismatch === 0, text }
}

function validateRoutes(routes: EdgeRouteInput[]): EdgeRouteInput[] | null {
  if (!Array.isArray(routes) || routes.length < 1 || routes.length > MAX_ROUTES) return null
  const normalized: EdgeRouteInput[] = []
  const seen = new Set<string>()
  for (const route of routes) {
    const hostname = normalizeHost(route?.hostname ?? '')
    const originSlug = String(route?.originSlug ?? '').trim()
    const originBaseUrl = String(route?.originBaseUrl ?? '').trim()
    if (!hostname || !originSlug || !originBaseUrl) return null
    let origin: URL
    try {
      origin = new URL(originBaseUrl)
    }
    catch {
      return null
    }
    if (!['http:', 'https:'].includes(origin.protocol)) return null
    const path = normalizePath(route.path ?? '/')
    const key = `${hostname}${path}`
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push({ hostname, path, originSlug, originBaseUrl: origin.origin })
  }
  return normalized
}

async function updateRoutePointers(
  env: LandingEdgeWorkerEnv,
  routes: EdgeRouteInput[],
  pointer: Omit<LandingArtifactRoutePointer, 'originSlug' | 'originBaseUrl'>,
): Promise<void> {
  const previous = new Map<string, string | null>()
  const changed: string[] = []
  try {
    for (const route of routes) {
      const key = buildCanonicalRouteKvKey(route.hostname, route.path)
      previous.set(key, await env.LANDING_ROUTES_KV.get(key, 'text'))
      const value: LandingArtifactRoutePointer = {
        ...pointer,
        originSlug: route.originSlug,
        originBaseUrl: route.originBaseUrl,
      }
      await env.LANDING_ROUTES_KV.put(key, JSON.stringify(value))
      changed.push(key)
    }
  }
  catch (error) {
    // Best-effort compensation prevents a partial multi-domain activation.
    for (const key of changed.reverse()) {
      const old = previous.get(key)
      if (old == null) await env.LANDING_ROUTES_KV.delete(key).catch(() => undefined)
      else await env.LANDING_ROUTES_KV.put(key, old).catch(() => undefined)
    }
    throw error
  }
}

async function handleAdmin(request: Request, env: LandingEdgeWorkerEnv): Promise<Response> {
  const secret = env.LANDING_EDGE_PUBLISH_SECRET?.trim() ?? ''
  if (secret.length < 32) return Response.json({ error: 'edge publish secret not configured' }, { status: 503 })
  const verified = await verifyAdminSignature(request, secret)
  if (!verified.ok) return Response.json({ error: 'invalid edge signature' }, { status: 403 })

  let payload: AdminPayload
  try {
    payload = JSON.parse(verified.text) as AdminPayload
  }
  catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const pageId = String(payload.pageId ?? '').trim()
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(pageId)) {
    return Response.json({ error: 'invalid pageId' }, { status: 422 })
  }
  const routes = validateRoutes(payload.routes)
  if (!routes) return Response.json({ error: 'invalid routes' }, { status: 422 })

  if (payload.action === 'unpublish') {
    await Promise.all(
      routes.map((route) =>
        env.LANDING_ROUTES_KV.delete(buildCanonicalRouteKvKey(route.hostname, route.path)),
      ),
    )
    return Response.json({ ok: true, action: 'unpublish', routes: routes.length })
  }

  const version = Number(payload.version)
  if (!Number.isInteger(version) || version < 1) {
    return Response.json({ error: 'invalid version' }, { status: 422 })
  }
  const key = artifactKey(pageId, version)

  let hash: string
  if (payload.action === 'publish') {
    if (typeof payload.html !== 'string' || payload.html.length === 0) {
      return Response.json({ error: 'html is required' }, { status: 422 })
    }
    hash = await sha256Hex(payload.html)
    if (payload.artifactHash && payload.artifactHash !== hash) {
      return Response.json({ error: 'artifact hash mismatch' }, { status: 409 })
    }

    const existing = await env.LANDING_ARTIFACTS_R2.head(key)
    if (existing) {
      if (existing.customMetadata?.sha256 !== hash) {
        return Response.json({ error: 'immutable artifact key already exists with different content' }, { status: 409 })
      }
    } else {
      await env.LANDING_ARTIFACTS_R2.put(key, payload.html, {
        httpMetadata: {
          contentType: 'text/html; charset=utf-8',
          cacheControl: 'public, max-age=31536000, immutable',
        },
        customMetadata: { sha256: hash, pageId, version: String(version) },
      })
      const verifiedObject = await env.LANDING_ARTIFACTS_R2.head(key)
      if (!verifiedObject || verifiedObject.customMetadata?.sha256 !== hash) {
        return Response.json({ error: 'artifact verification failed' }, { status: 502 })
      }
    }
  } else {
    const existing = await env.LANDING_ARTIFACTS_R2.head(key)
    if (!existing) return Response.json({ error: 'artifact not found' }, { status: 404 })
    hash = existing.customMetadata?.sha256 ?? ''
  }

  const pointer = {
    artifactKey: key,
    landingPageId: pageId,
    version,
    etag: hash,
    status: 'published' as const,
  }
  await updateRoutePointers(env, routes, pointer)
  return Response.json({
    ok: true,
    action: payload.action,
    artifactKey: key,
    artifactHash: hash,
    routes: routes.length,
  })
}

async function originFallback(
  request: Request,
  originBaseUrl: string,
  originSlug: string,
): Promise<Response> {
  const requestUrl = new URL(request.url)
  const target = new URL(resolveFreeSubdomainOriginPath(originSlug), originBaseUrl.replace(/\/$/, '') + '/')
  target.search = requestUrl.search
  const response = await fetch(new Request(target.toString(), request))
  const headers = new Headers(response.headers)
  headers.set('x-landing-edge', 'origin-fallback')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

async function serveArtifact(
  request: Request,
  env: LandingEdgeWorkerEnv,
  pointer: LandingArtifactRoutePointer,
): Promise<Response | null> {
  const object = await env.LANDING_ARTIFACTS_R2.get(pointer.artifactKey)
  if (!object?.body) return null

  const rawEtag = pointer.etag || object.httpEtag || ''
  const etag = rawEtag && !rawEtag.startsWith('"') ? `"${rawEtag}"` : rawEtag
  const ifNoneMatch = request.headers.get('if-none-match')
  if (etag && (ifNoneMatch === etag || ifNoneMatch === rawEtag)) {
    return new Response(null, { status: 304, headers: { ETag: etag } })
  }

  const headers = new Headers()
  object.writeHttpMetadata?.(headers)
  headers.set('Content-Type', 'text/html; charset=utf-8')
  // Public route URLs are mutable pointers even though the R2 object is immutable.
  headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('x-landing-edge', 'r2')
  headers.set('x-landing-version', String(pointer.version))
  if (etag) headers.set('ETag', etag)

  return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers })
}

export default {
  async fetch(request: Request, env: LandingEdgeWorkerEnv): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/__landing-edge/health') {
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
    }
    if (url.pathname === ADMIN_PATH) {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
      return handleAdmin(request, env)
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const host = normalizeHost(url.hostname)
    if (!host) return new Response('Not Found', { status: 404 })
    const path = normalizePath(url.pathname)

    const canonicalKey = buildCanonicalRouteKvKey(host, path)
    const pointer = await env.LANDING_ROUTES_KV.get<LandingArtifactRoutePointer>(canonicalKey, 'json')
    if (pointer?.artifactKey && pointer.status === 'published') {
      // SDK iframe embeds need the per-request resize messenger injected by
      // /p/[slug]. Keep that behavioral path on the origin while normal public
      // traffic is served from immutable R2.
      if (url.searchParams.get('embed') === '1' && pointer.originSlug) {
        recordEdgeMetric(env, 'origin_embed_fallback', host, path, pointer.version)
        return originFallback(
          request,
          pointer.originBaseUrl || env.LANDING_ORIGIN_BASE_URL,
          pointer.originSlug,
        )
      }
      try {
        const response = await serveArtifact(request, env, pointer)
        if (response) {
          recordEdgeMetric(env, 'r2_hit', host, path, pointer.version)
          return response
        }
        recordEdgeMetric(env, 'r2_miss', host, path, pointer.version)
      }
      catch {
        recordEdgeMetric(env, 'r2_error', host, path, pointer.version)
      }
      if (env.LANDING_EDGE_FALLBACK_ENABLED !== 'false' && pointer.originSlug) {
        recordEdgeMetric(env, 'origin_fallback', host, path, pointer.version)
        return originFallback(request, pointer.originBaseUrl || env.LANDING_ORIGIN_BASE_URL, pointer.originSlug)
      }
      return new Response('Not Found', { status: 404 })
    }

    // Migration dual-read: old custom-domain KV entries point to /p/{slug}.
    const legacyKey = buildCustomDomainKvKey(host, path)
    const legacy = await env.LANDING_ROUTES_KV.get<LandingEdgeRouteConfig>(legacyKey, 'json')
    if (legacy?.artifactKey && legacy.status === 'published') {
      const legacyPointer = legacy as LandingArtifactRoutePointer
      try {
        const response = await serveArtifact(request, env, legacyPointer)
        if (response) {
          recordEdgeMetric(env, 'legacy_r2_hit', host, path, legacyPointer.version)
          return response
        }
      }
      catch {
        recordEdgeMetric(env, 'legacy_r2_error', host, path, legacyPointer.version)
      }
    }
    if (legacy && env.LANDING_EDGE_FALLBACK_ENABLED !== 'false') {
      const originPath = resolveEdgeOriginPath(host, path, legacy)
      if (originPath) {
        recordEdgeMetric(env, 'legacy_origin_fallback', host, path)
        const target = new URL(originPath, legacy.originBaseUrl || env.LANDING_ORIGIN_BASE_URL)
        target.search = url.search
        const response = await fetch(new Request(target.toString(), request))
        const headers = new Headers(response.headers)
        headers.set('x-landing-edge', 'legacy-origin-fallback')
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
      }
    }

    const freeSlug = resolveFreeSubdomainSlug(host, env.FREE_SITE_DOMAIN)
    if (freeSlug && env.LANDING_EDGE_FALLBACK_ENABLED !== 'false') {
      recordEdgeMetric(env, 'free_origin_fallback', host, path)
      return originFallback(request, env.LANDING_ORIGIN_BASE_URL, freeSlug)
    }

    recordEdgeMetric(env, 'not_found', host, path)
    return new Response('Not Found', { status: 404 })
  },
}
