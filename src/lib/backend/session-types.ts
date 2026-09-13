import type { TenantJwtContext } from "@liora/api-types";

/** Safe browser-visible session metadata. Never add bearer/refresh credentials here. */
export interface BackendSessionSnapshot {
  authenticated: boolean;
  expiresAt: number | null;
  tenant: TenantJwtContext;
}

export const EMPTY_BACKEND_SESSION: BackendSessionSnapshot = {
  authenticated: false,
  expiresAt: null,
  tenant: {},
};
