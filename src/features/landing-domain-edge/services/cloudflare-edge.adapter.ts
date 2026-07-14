import type { CustomDomainDeliveryPort } from "../ports/custom-domain-delivery.port";
import type { EdgeRouteSyncResult, LandingDomainRoute } from "../types/domain-edge.types";
import {
  getCloudflareEdgeConfig,
  getLandingOriginBaseUrl,
  isCustomDomainEdgeEnabled,
} from "../config/domain-edge.flags";
import {
  deleteLandingRouteKv,
  putLandingRouteKv,
} from "./cloudflare-saas.client";
import { buildEdgeKvKey } from "./domain-hostname.util";

function disabledResult(message: string): EdgeRouteSyncResult {
  return { edgeSyncStatus: "disabled", message };
}

/**
 * Plan B — sync landing domain routes to Cloudflare Workers KV.
 * Without credentials: edgeSyncStatus stays pending (safe for local).
 */
export class CloudflareEdgeAdapter implements CustomDomainDeliveryPort {
  async syncRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult> {
    if (!isCustomDomainEdgeEnabled()) {
      return disabledResult(
        "Custom domain edge is disabled. Use platform URL /p/{slug} on localhost.",
      );
    }

    const config = getCloudflareEdgeConfig();
    const key = buildEdgeKvKey(route.hostname, route.pathPrefix);
    const payload = {
      originSlug: route.originSlug,
      originBaseUrl: getLandingOriginBaseUrl(),
      landingPageId: route.landingPageId,
    };

    if (!config.apiTokenConfigured || !config.kvNamespaceId || !config.accountId) {
      return {
        edgeSyncStatus: "pending",
        message: `Edge enabled but CF KV credentials incomplete — queued ${key} → /p/${route.originSlug}`,
        cloudflareHostnameId: route.cloudflareHostnameId ?? null,
      };
    }

    const put = await putLandingRouteKv(key, payload, {
      accountId: config.accountId,
      apiToken: process.env.CLOUDFLARE_API_TOKEN?.trim() || null,
      kvNamespaceId: config.kvNamespaceId,
    });

    if (!put.ok) {
      return {
        edgeSyncStatus: "error",
        message: put.message,
        cloudflareHostnameId: route.cloudflareHostnameId ?? null,
      };
    }

    return {
      edgeSyncStatus: "synced",
      message: put.message,
      cloudflareHostnameId: route.cloudflareHostnameId ?? null,
    };
  }

  async removeRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult> {
    if (!isCustomDomainEdgeEnabled()) {
      return disabledResult("Custom domain edge is disabled.");
    }

    const config = getCloudflareEdgeConfig();
    const key = buildEdgeKvKey(route.hostname, route.pathPrefix);

    if (!config.apiTokenConfigured || !config.kvNamespaceId || !config.accountId) {
      return {
        edgeSyncStatus: "pending",
        message: `KV credentials incomplete — local remove intent for ${key}`,
        cloudflareHostnameId: route.cloudflareHostnameId ?? null,
      };
    }

    const del = await deleteLandingRouteKv(key, {
      accountId: config.accountId,
      apiToken: process.env.CLOUDFLARE_API_TOKEN?.trim() || null,
      kvNamespaceId: config.kvNamespaceId,
    });

    if (!del.ok) {
      return {
        edgeSyncStatus: "error",
        message: del.message,
        cloudflareHostnameId: route.cloudflareHostnameId ?? null,
      };
    }

    return {
      edgeSyncStatus: "disabled",
      message: del.message,
      cloudflareHostnameId: route.cloudflareHostnameId ?? null,
    };
  }

  async getStatus(route: LandingDomainRoute): Promise<EdgeRouteSyncResult> {
    return {
      edgeSyncStatus: route.edgeStatus,
      message: `Edge status for ${route.hostname}${route.pathPrefix}`,
      cloudflareHostnameId: route.cloudflareHostnameId ?? null,
    };
  }
}

export const cloudflareEdgeAdapter = new CloudflareEdgeAdapter();
