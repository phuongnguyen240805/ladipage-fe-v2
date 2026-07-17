/**
 * Free subdomain helpers — Plan A.
 * User-facing publicUrl: {scheme}://{slug}.{FREE_SITE_DOMAIN}[:port]
 * Internal platform path (rewrite/revalidate only): /p/{slug}
 * No DNS/CF calls here; pure string + validation.
 */

import {
  getFreeSiteDomain,
  getLandingOriginBaseUrl,
  isFreeSubdomainEnabled,
} from "../config/domain-edge.flags";

export { getFreeSiteDomain, getLandingOriginBaseUrl, isFreeSubdomainEnabled };

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
 * Build {scheme}://{slug}.{base}[:port] from landing origin.
 * Local (http://localhost:3000) → http://slug.base:3000 for Host routing.
 * Prod https origin → https://slug.base (no port).
 * Returns null when flag off, base missing, or slug invalid.
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

  const host = `${normalizedSlug}.${base}`;
  return formatFreeSubdomainAbsoluteUrl(host);
}

/**
 * Scheme + optional port from NEXT_PUBLIC_APP_URL / LANDING_ORIGIN_URL.
 * Keeps free-subdomain links openable against local Next (port 3000).
 */
export function formatFreeSubdomainAbsoluteUrl(hostnameWithOptionalPort: string): string {
  const hostOnly = hostnameWithOptionalPort.replace(/:\d+$/, "").toLowerCase();
  try {
    const originRaw = getLandingOriginBaseUrl();
    const origin = new URL(
      originRaw.includes("://") ? originRaw : `http://${originRaw}`,
    );
    const scheme = origin.protocol === "http:" ? "http" : "https";
    const port =
      origin.port && origin.port !== "80" && origin.port !== "443"
        ? `:${origin.port}`
        : "";
    return `${scheme}://${hostOnly}${port}`;
  } catch {
    return `https://${hostOnly}`;
  }
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

/** Path prefixes that must not be rewritten on free-subdomain hosts. */
const FREE_SUBDOMAIN_PASSTHROUGH_PREFIXES = [
  "/_next",
  "/api",
  "/images",
  "/favicon.ico",
  "/favicon.svg",
  "/src/",
  "/@vite",
  "/@fs",
  "/@id",
  "/@react-refresh",
  "/node_modules/",
  "/assets/",
  "/runtime/",
  "/__vite",
  "/_instatic/",
  "/uploads/",
  "/admin/api/",
] as const;

/**
 * Plan A Host routing: `{slug}.{FREE_SITE}` → internal path `/p/{slug}`.
 * Returns rewrite pathname or null (caller should next()).
 */
export function resolveFreeSubdomainRewritePath(
  host: string,
  pathname: string,
  options?: {
    enabled?: boolean;
    baseDomain?: string | null;
  },
): string | null {
  const enabled = options?.enabled ?? isFreeSubdomainEnabled();
  if (!enabled) return null;

  const base =
    options?.baseDomain !== undefined ? options.baseDomain : getFreeSiteDomain();
  const slug = hostToFreeSubdomainSlug(host, base);
  if (!slug) return null;

  const path = pathname || "/";
  if (
    FREE_SUBDOMAIN_PASSTHROUGH_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(prefix),
    )
  ) {
    return null;
  }

  const platformPath = buildPlatformLandingPath(slug);

  // Already the public page for this slug — no rewrite needed.
  if (path === platformPath || path.startsWith(`${platformPath}/`)) {
    return null;
  }

  return platformPath;
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

/**
 * Internal Next.js public page path (route file `app/p/[slug]`).
 * Use only for rewrite / revalidate / platform fallback — not as the primary share link when Plan A is on.
 */
export const PLATFORM_PUBLIC_PAGE_PREFIX = "/p";

export function buildPlatformLandingPath(slug: string): string {
  const normalized = normalizeFreeSubdomainSlug(slug) || String(slug || "").trim();
  return `${PLATFORM_PUBLIC_PAGE_PREFIX}/${normalized}`;
}

/**
 * Absolute platform URL: `{origin}/p/{slug}`.
 * Prefer `resolveLandingPublicViewUrl` for user-facing links.
 */
export function buildPlatformLandingUrl(
  slug: string,
  origin: string = getLandingOriginBaseUrl(),
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${buildPlatformLandingPath(slug)}`;
}

/**
 * User-facing public URL for a published landing page.
 * Priority: free subdomain (Plan A) → platform `/p/{slug}`.
 * Does not include custom domain routes (needs DB); pass `storedPublicUrl` when known.
 */
export function resolveLandingPublicViewUrl(
  slug: string,
  options?: {
    /** Prefer DB/API stored absolute URL when present */
    storedPublicUrl?: string | null;
    /** Browser origin override (client) */
    origin?: string;
  },
): string {
  const stored = options?.storedPublicUrl?.trim();
  if (stored && /^https?:\/\//i.test(stored)) {
    return stored;
  }

  const free = buildFreeSubdomainUrl(slug);
  if (free) return free;

  if (stored?.startsWith("/")) {
    const origin = (options?.origin ?? getLandingOriginBaseUrl()).replace(/\/$/, "");
    return `${origin}${stored}`;
  }

  return buildPlatformLandingUrl(slug, options?.origin ?? getLandingOriginBaseUrl());
}
