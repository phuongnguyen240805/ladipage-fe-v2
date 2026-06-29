import { decodeJwt } from "jose";
import type { TenantJwtContext } from "@liora/api-types";

export function decodeJwtExp(token: string): number | null {
  try {
    const payload = decodeJwt(token);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function decodeJwtTenantContext(token: string): TenantJwtContext {
  try {
    const payload = decodeJwt(token);
    return {
      organizationId:
        typeof payload.organizationId === "string"
          ? payload.organizationId
          : undefined,
      tenantId:
        typeof payload.tenantId === "number" ? payload.tenantId : undefined,
      activeTenantId:
        typeof payload.activeTenantId === "number"
          ? payload.activeTenantId
          : undefined,
    };
  } catch {
    return {};
  }
}

export function isJwtExpired(token: string, bufferSeconds = 60): boolean {
  const exp = decodeJwtExp(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp - now < bufferSeconds;
}