/**
 * Phase 2 optional — custom domain via Cloudflare edge.
 * Local dev: keep false, use http://localhost:3000/p/{slug}
 */
export function isCustomDomainEdgeEnabled(): boolean {
  return process.env.LANDING_CUSTOM_DOMAIN_EDGE_ENABLED === "true";
}

export function getLandingOriginBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.LANDING_ORIGIN_URL ||
    "http://localhost:3000";

  return configured.replace(/\/$/, "");
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