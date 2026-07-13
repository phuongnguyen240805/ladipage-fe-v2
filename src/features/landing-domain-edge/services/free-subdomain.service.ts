/**
 * Free subdomain helpers — Plan A.
 * publicUrl shape: https://{slug}.{FREE_SITE_DOMAIN}
 * No DNS/CF calls here; pure string + validation.
 */

import {
  getFreeSiteDomain,
  isFreeSubdomainEnabled,
} from "../config/domain-edge.flags";

export { getFreeSiteDomain, isFreeSubdomainEnabled };

/** Host labels reserved for platform / infra — never free-site slugs. */
export const FREE_SUBDOMAIN_RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "static",
  "cdn",
  "mail",
  "ftp",
  "localhost",
  "staging",
  "fallback",
  "edge",
  "assets",
  "media",
  "docs",
  "status",
  "dev",
  "test",
  "internal",
]);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type FreeSubdomainDeliveryMode = "proxy" | "r2";

export function getFreeSubdomainDeliveryMode(): FreeSubdomainDeliveryMode {
  const mode = (process.env.FREE_SUBDOMAIN_DELIVERY ?? "proxy").trim().toLowerCase();
  return mode === "r2" ? "r2" : "proxy";
}

/** Normalize a page slug for hostname label use. Empty if unusable. */
export function normalizeFreeSubdomainSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function isReservedFreeSubdomainSlug(slug: string): boolean {
  const normalized = normalizeFreeSubdomainSlug(slug);
  return !normalized || FREE_SUBDOMAIN_RESERVED_SLUGS.has(normalized);
}

export function isValidFreeSubdomainSlug(slug: string): boolean {
  const normalized = normalizeFreeSubdomainSlug(slug);
  if (!normalized || !SLUG_PATTERN.test(normalized)) return false;
  if (FREE_SUBDOMAIN_RESERVED_SLUGS.has(normalized)) return false;
  return true;
}

/**
 * Build https://{slug}.{base}. Returns null when flag off, base missing, or slug invalid.
 */
export function buildFreeSubdomainUrl(
  slug: string,
  baseDomain: string | null = getFreeSiteDomain(),
): string | null {
  if (!isFreeSubdomainEnabled()) return null;
  if (!baseDomain) return null;

  const normalizedSlug = normalizeFreeSubdomainSlug(slug);
  if (!isValidFreeSubdomainSlug(normalizedSlug)) return null;

  const base = baseDomain.replace(/^\*\./, "").replace(/\/$/, "").toLowerCase();
  if (!base || base.includes("/") || base.includes("://")) return null;

  return `https://${normalizedSlug}.${base}`;
}

/**
 * Parse free-site Host header → slug.
 * `cafe-ha-noi.liora.app` + base `liora.app` → `cafe-ha-noi`
 * Apex or multi-label under base → null.
 */
export function hostToFreeSubdomainSlug(
  host: string,
  baseDomain: string | null = getFreeSiteDomain(),
): string | null {
  if (!baseDomain) return null;

  const hostname = host.trim().toLowerCase().replace(/\.$/, "").split(":")[0] ?? "";
  const base = baseDomain.replace(/^\*\./, "").toLowerCase();
  if (!hostname || !base) return null;

  if (hostname === base) return null;
  const suffix = `.${base}`;
  if (!hostname.endsWith(suffix)) return null;

  const label = hostname.slice(0, -suffix.length);
  if (!label || label.includes(".")) return null;
  if (!isValidFreeSubdomainSlug(label)) return null;

  return normalizeFreeSubdomainSlug(label);
}

/** Prefer custom → free subdomain → platform path. */
export function pickPublicUrl(input: {
  customPublicUrl?: string | null;
  subdomainUrl?: string | null;
  platformUrl: string;
}): string {
  if (input.customPublicUrl) return input.customPublicUrl;
  if (input.subdomainUrl) return input.subdomainUrl;
  return input.platformUrl;
}
