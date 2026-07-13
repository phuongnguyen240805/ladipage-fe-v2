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
 * Phase B (r2): reserved for artifact upload; currently same as proxy URL build.
 */
export async function applyFreeSubdomainPublishHook(input: {
  slug: string;
  pageId: string;
  /** Published HTML — reserved for R2 upload when FREE_SUBDOMAIN_DELIVERY=r2 */
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
    // Artifact upload not wired yet — URL is still valid once Worker serves proxy/R2.
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
 * R2 mode later: delete object + KV here.
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
      message: "R2 cleanup not implemented — origin draft status is source of truth",
    };
  }

  return {
    cleaned: true,
    message: "proxy mode: no edge artifact to remove",
  };
}
