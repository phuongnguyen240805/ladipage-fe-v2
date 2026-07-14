import { getCustomDomainCnameTarget, type DomainSslStatus, type DomainVerifyStatus } from "./domain-hostname.util";

export interface FormattedLandingDomain {
  id: string;
  name: string;
  status: DomainVerifyStatus;
  platform: string;
  sslStatus: DomainSslStatus;
  cnameTarget: string | null;
  cloudflareHostnameId: string | null;
  verificationErrors: unknown;
  lastCheckedAt: string | null;
  dnsInstruction: string | null;
  updatedAt: string;
}

function mapStatus(raw: unknown): DomainVerifyStatus {
  const s = String(raw ?? "PENDING").toUpperCase();
  if (s === "VERIFIED" || s === "ACTIVE") return "VERIFIED";
  if (s === "ERROR" || s === "FAILED") return "ERROR";
  if (s === "UNVERIFIED") return "UNVERIFIED";
  if (s === "PENDING") return "PENDING";
  // Legacy rows that were fake-verified
  if (s === "TRUE" || s === "1") return "VERIFIED";
  return "PENDING";
}

function mapSsl(raw: unknown): DomainSslStatus {
  const s = String(raw ?? "PENDING").toUpperCase();
  if (s === "ACTIVE") return "ACTIVE";
  if (s === "INACTIVE") return "INACTIVE";
  return "PENDING";
}

export function formatLandingDomainRow(row: Record<string, unknown>): FormattedLandingDomain {
  const updated = row.updated_at ? new Date(String(row.updated_at)) : new Date();
  const name = String(row.name ?? "");
  const cnameTarget =
    (row.cname_target ? String(row.cname_target) : null) || getCustomDomainCnameTarget();
  const status = mapStatus(row.status);
  const sslStatus = mapSsl(row.ssl_status);

  return {
    id: String(row.id),
    name,
    status,
    platform: String(row.platform ?? "Ladipage"),
    sslStatus,
    cnameTarget,
    cloudflareHostnameId: row.cloudflare_hostname_id
      ? String(row.cloudflare_hostname_id)
      : null,
    verificationErrors: row.verification_errors ?? null,
    lastCheckedAt: row.last_checked_at ? String(row.last_checked_at) : null,
    dnsInstruction:
      name && cnameTarget
        ? `CNAME ${name} → ${cnameTarget}`
        : null,
    updatedAt:
      updated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      ", " +
      updated.toLocaleDateString("vi-VN"),
  };
}
