export type RenderEngine = "visual-editor" | "puck" | "instatic";

export interface PublishedMeta {
  title: string;
  description?: string;
  ogImage?: string;
}

export interface PublishLandingPageRequest {
  draftOverride?: unknown;
  preserveHtml?: boolean;
  /** Phase 2 optional — custom domain via Cloudflare edge */
  domainId?: string;
  path?: string;
}

export interface PublishResult {
  pageId: string;
  slug: string;
  publicUrl: string;
  publishedAt: string;
  versionId: string | null;
  renderEngine: RenderEngine;
  /** Always /p/slug on platform origin (localhost or app URL) */
  platformUrl: string;
  /** Free wildcard https://{slug}.{FREE_SITE_DOMAIN} when Plan A enabled */
  subdomainUrl?: string | null;
  /** Set when domain route mapped + custom edge enabled */
  customPublicUrl?: string | null;
  deliveryMode: "platform" | "subdomain" | "custom-domain";
  edgeSyncStatus: "disabled" | "pending" | "synced" | "error";
  /** Nest AI-SEO auto-sync (null when skipped/failed — publish still ok) */
  aiSeo?: {
    seoProjectId: string | null;
    seoSyncStatus: string;
    trafficSyncStatus: string;
    autoLinked: boolean;
    scriptsInjected: { seoPixel: boolean; umami: boolean };
  } | null;
}

export interface UnpublishResult {
  pageId: string;
  status: "draft";
  visibility: "private";
}

export interface LandingPageRow {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  status: string;
  visibility: string;
  editor_data: unknown;
  published_html: string | null;
  published_at: string | null;
  render_engine?: string | null;
  publish_version?: number | null;
  published_meta?: PublishedMeta | null;
  page_settings?: Record<string, unknown> | null;
  external_site_id?: string | null;
  external_page_id?: string | null;
}
