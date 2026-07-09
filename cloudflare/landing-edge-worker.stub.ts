/**
 * Cloudflare Worker stub — Phase 2 optional custom domain delivery.
 *
 * Deploy when LANDING_CUSTOM_DOMAIN_EDGE_ENABLED=true in production.
 * KV mapping: `${hostname}${pathname}` → { originSlug, originBaseUrl }
 *
 * Local dev: không chạy Worker — dùng http://localhost:3000/p/{slug}
 */

export interface LandingEdgeRouteConfig {
  originSlug: string;
  originBaseUrl: string;
  landingPageId: string;
}

export interface LandingEdgeEnv {
  LANDING_ROUTES_KV: KVNamespace;
  LANDING_ORIGIN_BASE_URL: string;
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
  if (!route) return null;
  const slug = route.originSlug;
  return `/p/${slug}`;
}

// Example Worker fetch handler (not deployed — reference for Phase 2):
//
// export default {
//   async fetch(request: Request, env: LandingEdgeEnv): Promise<Response> {
//     const url = new URL(request.url);
//     const key = `${url.hostname}${url.pathname.replace(/\/$/, "") || "/"}`;
//     const config = await env.LANDING_ROUTES_KV.get<LandingEdgeRouteConfig>(key, "json");
//     if (!config) return new Response("Not found", { status: 404 });
//     const origin = new URL(resolveEdgeOriginPath(url.hostname, url.pathname, config)!, env.LANDING_ORIGIN_BASE_URL);
//     return fetch(origin.toString(), request);
//   },
// };