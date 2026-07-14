/**
 * Plan B — hostname / path normalization for customer domains.
 */

export function normalizeCustomerHostname(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
    .split(":")[0] ?? "";
}

/** DNS-ish hostname: labels of a-z0-9 and hyphens, at least one dot. */
export function isValidCustomerHostname(hostname: string): boolean {
  if (!hostname || hostname.length > 253) return false;
  if (hostname.startsWith(".") || hostname.endsWith(".")) return false;
  if (!hostname.includes(".")) return false;
  const labels = hostname.split(".");
  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
  );
}

export function normalizeRoutePathPrefix(path?: string): string {
  const raw = (path ?? "/").trim();
  if (!raw || raw === "/") return "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

/** KV key: hostname + path (root → host + "/") */
export function buildEdgeKvKey(hostname: string, pathPrefix: string): string {
  const host = normalizeCustomerHostname(hostname);
  const path = normalizeRoutePathPrefix(pathPrefix);
  return `${host}${path === "/" ? "/" : path}`;
}

export function getCustomDomainCnameTarget(): string {
  return (
    process.env.CUSTOM_DOMAIN_CNAME_TARGET?.trim() ||
    process.env.CLOUDFLARE_SAAS_FALLBACK_ORIGIN?.trim() ||
    "fallback.liora.app"
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

export type DomainVerifyStatus = "PENDING" | "VERIFIED" | "UNVERIFIED" | "ERROR";
export type DomainSslStatus = "PENDING" | "ACTIVE" | "INACTIVE";

export function mapCloudflareSslToStatus(
  sslStatus: string | null | undefined,
): DomainSslStatus {
  const s = (sslStatus ?? "").toLowerCase();
  if (s === "active") return "ACTIVE";
  if (s === "pending_validation" || s === "pending_issuance" || s === "initializing") {
    return "PENDING";
  }
  return "INACTIVE";
}

export function mapCloudflareHostnameToDomainStatus(input: {
  hostnameStatus?: string | null;
  sslStatus?: string | null;
}): DomainVerifyStatus {
  const h = (input.hostnameStatus ?? "").toLowerCase();
  const ssl = mapCloudflareSslToStatus(input.sslStatus);
  if (h === "active" && ssl === "ACTIVE") return "VERIFIED";
  if (h === "active" && ssl === "PENDING") return "PENDING";
  if (h === "pending" || h === "pending_validation") return "PENDING";
  if (h === "moved" || h === "deleted") return "ERROR";
  if (ssl === "INACTIVE" && h === "active") return "UNVERIFIED";
  return "PENDING";
}
