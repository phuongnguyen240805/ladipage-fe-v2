/**
 * Landing public delivery flags.
 * Local dev: keep free/custom domain flags false → http://localhost:3000/p/{slug}
 */

export function isCustomDomainEdgeEnabled(): boolean {
  return process.env.LANDING_CUSTOM_DOMAIN_EDGE_ENABLED === "true";
}

/** Plan A — free wildcard subdomain https://{slug}.{FREE_SITE_DOMAIN} */
export function isFreeSubdomainEnabled(): boolean {
  return process.env.LANDING_FREE_SUBDOMAIN_ENABLED === "true";
}

export function getLandingOriginBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.LANDING_ORIGIN_URL ||
    "http://localhost:3000";

  return configured.replace(/\/$/, "");
}

/**
 * Apex for free sites (no scheme, no leading *.).
 * e.g. liora.app → cafe.liora.app
 */
export function getFreeSiteDomain(): string | null {
  const raw =
    process.env.FREE_SITE_DOMAIN?.trim() ||
    process.env.NEXT_PUBLIC_FREE_SITE_DOMAIN?.trim() ||
    "";
  if (!raw) return null;
  return raw
    .replace(/^\*\./, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

export function getCloudflareEdgeConfig() {
  return {
    enabled: isCustomDomainEdgeEnabled(),
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? null,
    kvNamespaceId: process.env.CLOUDFLARE_LANDING_ROUTES_KV_ID ?? null,
    workerServiceName: process.env.CLOUDFLARE_LANDING_EDGE_WORKER ?? "liora-landing-edge",
    apiTokenConfigured: Boolean(process.env.CLOUDFLARE_API_TOKEN),
  };
}
