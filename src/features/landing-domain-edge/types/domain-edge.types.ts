/** Delivery mode — platform = /p/slug; custom-domain = Cloudflare edge (Phase 2, optional). */
export type LandingDeliveryMode = "platform" | "custom-domain";

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
  customPublicUrl: string | null;
  edgeSyncStatus: EdgeSyncStatus;
}

export interface EdgeRouteSyncResult {
  edgeSyncStatus: EdgeSyncStatus;
  message: string;
  cloudflareHostnameId?: string | null;
}