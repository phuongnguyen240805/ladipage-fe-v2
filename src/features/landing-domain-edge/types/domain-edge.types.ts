/**
 * Delivery mode:
 * - platform: /p/{slug} on app origin
 * - subdomain: https://{slug}.{FREE_SITE_DOMAIN} (Plan A)
 * - custom-domain: customer hostname via Cloudflare edge (Plan B)
 */
export type LandingDeliveryMode = "platform" | "subdomain" | "custom-domain";

export type EdgeSyncStatus = "disabled" | "pending" | "synced" | "error";

export interface LandingDomainRoute {
  id: string;
  domainId: string;
  landingPageId: string;
  hostname: string;
  pathPrefix: string;
  originSlug: string;
  edgeStatus: EdgeSyncStatus;
  cloudflareHostnameId?: string | null;
}

export interface CustomDomainPublishContext {
  domainId?: string;
  path?: string;
}

export interface ResolvedPublicUrls {
  deliveryMode: LandingDeliveryMode;
  platformUrl: string;
  /** Free wildcard URL when Plan A enabled + valid slug */
  subdomainUrl: string | null;
  /** Customer domain URL when Plan B enabled + route mapped */
  customPublicUrl: string | null;
  edgeSyncStatus: EdgeSyncStatus;
}

export interface EdgeRouteSyncResult {
  edgeSyncStatus: EdgeSyncStatus;
  message: string;
  cloudflareHostnameId?: string | null;
}
