import type { EdgeRouteSyncResult, LandingDomainRoute } from "../types/domain-edge.types";

/**
 * Port for Cloudflare edge custom-domain delivery (Plan B).
 * Implementations: CloudflareEdgeAdapter (stub) → KV / Workers API.
 * Free subdomain (Plan A) uses free-subdomain.service + Worker Host routing — not this port.
 */
export interface CustomDomainDeliveryPort {
  syncRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult>;
  removeRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult>;
  getStatus(route: LandingDomainRoute): Promise<EdgeRouteSyncResult>;
}