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
  /** Set when domain route mapped + edge enabled */
  customPublicUrl?: string | null;
  deliveryMode: "platform" | "custom-domain";
  edgeSyncStatus: "disabled" | "pending" | "synced" | "error";
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