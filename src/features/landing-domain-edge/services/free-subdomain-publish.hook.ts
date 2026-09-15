import type { EdgeSyncStatus } from "../types/domain-edge.types";
import {
  buildFreeSubdomainUrl,
  getFreeSubdomainDeliveryMode,
  isFreeSubdomainEnabled,
} from "./free-subdomain.service";

export interface FreeSubdomainPublishResult {
  subdomainUrl: string | null;
  edgeSyncStatus: EdgeSyncStatus;
  /** Present when flag on but URL could not be built (missing base / invalid slug). */
  skippedReason: string | null;
}

/**
 * Plan A publish side-effect for free subdomain.
 * MVP (proxy): only builds URL — Worker proxies to /p/{slug}; no R2/KV.
 * Phase B (r2): this hook resolves the URL; immutable R2/KV sync is owned by domain-edge-publish.hook.
 */
export async function applyFreeSubdomainPublishHook(input: {
  slug: string;
  pageId: string;
  /** Kept for compatibility; immutable artifact upload is handled by the shared edge hook. */
  html?: string;
}): Promise<FreeSubdomainPublishResult> {
  void input.pageId;
  void input.html;

  if (!isFreeSubdomainEnabled()) {
    return {
      subdomainUrl: null,
      edgeSyncStatus: "disabled",
      skippedReason: "LANDING_FREE_SUBDOMAIN_ENABLED is not true",
    };
  }

  const subdomainUrl = buildFreeSubdomainUrl(input.slug);
  if (!subdomainUrl) {
    return {
      subdomainUrl: null,
      edgeSyncStatus: "disabled",
      skippedReason: "invalid_slug_or_missing_FREE_SITE_DOMAIN",
    };
  }

  const delivery = getFreeSubdomainDeliveryMode();
  if (delivery === "r2") {
    // The shared domain-edge artifact hook performs R2 upload after publish commit.
    return {
      subdomainUrl,
      edgeSyncStatus: "pending",
      skippedReason: null,
    };
  }

  return {
    subdomainUrl,
    edgeSyncStatus: "disabled",
    skippedReason: null,
  };
}

/**
 * Unpublish cleanup for free subdomain.
 * MVP proxy: no-op (origin /p/{slug} already returns 404 when status=draft).
 * R2 mode cleanup is owned by removeDomainEdgeRoutesForPublishedPage().
 */
export async function applyFreeSubdomainUnpublishHook(input: {
  slug: string;
  pageId: string;
}): Promise<{ cleaned: boolean; message: string }> {
  void input.slug;
  void input.pageId;

  if (!isFreeSubdomainEnabled()) {
    return { cleaned: false, message: "free subdomain disabled" };
  }

  if (getFreeSubdomainDeliveryMode() === "r2") {
    return {
      cleaned: false,
      message: "R2 cleanup is owned by the shared domain-edge unpublish hook",
    };
  }

  return {
    cleaned: true,
    message: "proxy mode: no edge artifact to remove",
  };
}
