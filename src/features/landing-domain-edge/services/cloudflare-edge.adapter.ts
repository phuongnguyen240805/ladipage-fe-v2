import type { CustomDomainDeliveryPort } from "../ports/custom-domain-delivery.port";
import type { EdgeRouteSyncResult, LandingDomainRoute } from "../types/domain-edge.types";
import { getCloudflareEdgeConfig, isCustomDomainEdgeEnabled } from "../config/domain-edge.flags";

function disabledResult(message: string): EdgeRouteSyncResult {
  return { edgeSyncStatus: "disabled", message };
}

/**
 * Stub adapter — records intent for Cloudflare Workers + KV sync.
 * Replace body of syncRoute/removeRoute with Workers API / KV PUT when credentials exist.
 */
export class CloudflareEdgeAdapter implements CustomDomainDeliveryPort {
  async syncRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult> {
    if (!isCustomDomainEdgeEnabled()) {
      return disabledResult(
        "Custom domain edge is disabled. Use platform URL /p/{slug} on localhost.",
      );
    }

    const config = getCloudflareEdgeConfig();
    if (!config.apiTokenConfigured || !config.kvNamespaceId) {
      return {
        edgeSyncStatus: "pending",
        message:
          "Edge enabled but CLOUDFLARE_API_TOKEN or CLOUDFLARE_LANDING_ROUTES_KV_ID missing — route queued for manual sync.",
        cloudflareHostnameId: route.cloudflareHostnameId ?? null,
      };
    }

    // Future: KV key `host:path` → { originSlug, landingPageId, originBaseUrl }
    return {
      edgeSyncStatus: "pending",
      message: `Queued edge sync for ${route.hostname}${route.pathPrefix} → /p/${route.originSlug}`,
      cloudflareHostnameId: route.cloudflareHostnameId ?? null,
    };
  }

  async removeRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult> {
    if (!isCustomDomainEdgeEnabled()) {
      return disabledResult("Custom domain edge is disabled.");
    }

    return {
      edgeSyncStatus: "pending",
      message: `Queued edge removal for ${route.hostname}${route.pathPrefix}`,
    };
  }

  async getStatus(route: LandingDomainRoute): Promise<EdgeRouteSyncResult> {
    return {
      edgeSyncStatus: route.edgeStatus,
      message: `Edge status for ${route.hostname}`,
      cloudflareHostnameId: route.cloudflareHostnameId ?? null,
    };
  }
}

export const cloudflareEdgeAdapter = new CloudflareEdgeAdapter();