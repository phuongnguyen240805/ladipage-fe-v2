import type { EdgeRouteSyncResult, LandingDomainRoute } from "../types/domain-edge.types";

/**
 * Port for Cloudflare edge (Phase 2).
 * Implementations: CloudflareEdgeAdapter (stub now) → Cloudflare KV / Workers API later.
 * Subdomain routing will use a separate adapter implementing the same port.
 */
export interface CustomDomainDeliveryPort {
  syncRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult>;
  removeRoute(route: LandingDomainRoute): Promise<EdgeRouteSyncResult>;
  getStatus(route: LandingDomainRoute): Promise<EdgeRouteSyncResult>;
}