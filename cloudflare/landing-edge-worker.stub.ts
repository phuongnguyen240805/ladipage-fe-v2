/**
 * Cloudflare Worker stub — Plan A free subdomain + Plan B custom domain.
 *
 * Free subdomain (Plan A, proxy MVP):
 *   Host {slug}.{FREE_SITE_DOMAIN} → fetch ORIGIN/p/{slug}
 *
 * Custom domain (Plan B):
 *   KV `${hostname}${pathname}` → { originSlug, originBaseUrl }
 *
 * Local dev: Next middleware rewrites Host {slug}.{FREE_SITE} → /p/{slug}
 *   (same app process; no Worker required). Staging/prod: deploy this Worker
 *   with DNS *.FREE_SITE → Worker → ORIGIN/p/{slug}.
 */

export interface LandingEdgeRouteConfig {
  originSlug: string;
  originBaseUrl: string;
  landingPageId: string;
}

/**
 * Minimal Cloudflare KV binding shape.
 * Avoids depending on `@cloudflare/workers-types` so Next.js/Vercel builds type-check cleanly.
 */
export interface LandingRoutesKvNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get<T>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface LandingEdgeEnv {
  LANDING_ROUTES_KV: LandingRoutesKvNamespace;
  LANDING_ORIGIN_BASE_URL: string;
  /** e.g. liora.app — used to detect free-subdomain Host */
  FREE_SITE_DOMAIN?: string;
}

const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "static",
  "cdn",
  "mail",
  "ftp",
  "localhost",
  "staging",
  "fallback",
  "edge",
  "assets",
  "media",
  "docs",
  "status",
  "dev",
  "test",
  "internal",
]);

/**
 * Resolve free-subdomain Host → slug.
 * cafe-ha-noi.liora.app + base liora.app → cafe-ha-noi
 */
export function resolveFreeSubdomainSlug(
  hostname: string,
  freeSiteDomain: string | undefined,
): string | null {
  if (!freeSiteDomain) return null;
  const host = hostname.trim().toLowerCase().replace(/\.$/, "").split(":")[0] ?? "";
  const base = freeSiteDomain
    .replace(/^\*\./, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
  if (!host || !base || host === base) return null;
  const suffix = `.${base}`;
  if (!host.endsWith(suffix)) return null;
  const label = host.slice(0, -suffix.length);
  if (!label || label.includes(".")) return null;
  if (RESERVED.has(label)) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return null;
  return label;
}

/** Absolute origin path for free subdomain proxy. */
export function resolveFreeSubdomainOriginPath(slug: string): string {
  return `/p/${slug}`;
}

/**
 * Plan B KV key — must match FE buildEdgeKvKey(hostname, pathPrefix).
 * Root path stores as `host/` ; other paths without trailing slash.
 */
export function buildCustomDomainKvKey(hostname: string, pathname: string): string {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "").split(":")[0] ?? "";
  let path = pathname.trim() || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "") || "/";
  return path === "/" ? `${host}/` : `${host}${path}`;
}

/**
 * Resolve incoming custom-domain request to platform origin path /p/{slug}.
 * Wire into wrangler.toml + KV sync from CloudflareEdgeAdapter.syncRoute().
 */
export function resolveEdgeOriginPath(
  hostname: string,
  pathname: string,
  route: LandingEdgeRouteConfig | null,
): string | null {
  void hostname;
  void pathname;
  if (!route) return null;
  return `/p/${route.originSlug}`;
}

// Example Worker fetch handler (not deployed — reference Plan A + B):
//
// export default {
//   async fetch(request: Request, env: LandingEdgeEnv): Promise<Response> {
//     const url = new URL(request.url);
//     const host = url.hostname;
//
//     // Plan A — free subdomain proxy
//     const freeSlug = resolveFreeSubdomainSlug(host, env.FREE_SITE_DOMAIN);
//     if (freeSlug) {
//       const origin = new URL(
//         resolveFreeSubdomainOriginPath(freeSlug),
//         env.LANDING_ORIGIN_BASE_URL.replace(/\/$/, "") + "/",
//       );
//       return fetch(origin.toString(), request);
//     }
//
//     // Plan B — custom domain KV
//     const key = buildCustomDomainKvKey(host, url.pathname);
//     const config = await env.LANDING_ROUTES_KV.get<LandingEdgeRouteConfig>(key, "json");
//     if (!config) return new Response("Not found", { status: 404 });
//     const origin = new URL(
//       resolveEdgeOriginPath(host, url.pathname, config)!,
//       config.originBaseUrl || env.LANDING_ORIGIN_BASE_URL,
//     );
//     return fetch(origin.toString(), request);
//   },
// };
