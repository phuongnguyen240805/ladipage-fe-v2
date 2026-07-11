/** How long a validation result is cached in memory */
export const TOKEN_VALIDATION_CACHE_TTL_MS = 5 * 60 * 1000;

/** How often AuthGuard / useTokenRefresh re-validates an active session */
export const SESSION_REVALIDATION_TTL_MS = 5 * 60 * 1000;

/** Refresh tokens this many ms before recorded expiry */
export const TOKEN_EXPIRY_BUFFER_MS = 10 * 60 * 1000;

/** Proactive Nest JWT refresh buffer (seconds) */
export const NEST_JWT_REFRESH_BUFFER_SEC = 5 * 60;

export const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "ladipage-session";

export const FB_SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_FB_SESSION_COOKIE_NAME ?? "ladipage-fb-session";

export const SB_REFRESH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SB_REFRESH_COOKIE_NAME ?? "ladipage-sb-refresh";

export const AUTH_STORE_KEY = "ladipage-auth-store";

export const LEGACY_FB_AUTH_STORE_KEY = "facebook-auth-store";

export const GRAPH_API_VERSION =
  process.env.NEXT_PUBLIC_FB_GRAPH_VERSION ?? "v21.0";

export const PUBLIC_AUTH_PATHS = ["/signin", "/signup", "/error-404"];

/** Routes that must not require Nest JWT session (public runtime / other products) */
export const PUBLIC_ROUTE_PREFIXES = ["/p/", "/templates/", "/education/"];

/**
 * Instatic same-origin rewrite paths (Vite module graph + CMS).
 * Must never hit JWT refresh/signin redirects — that returns HTML and breaks
 * `import()` with "Failed to fetch dynamically imported module".
 */
export const INSTATIC_ASSET_PREFIXES = [
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

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function isInstaticAssetPath(pathname: string): boolean {
  if (pathname === "/favicon.svg" || pathname === "/@react-refresh") return true;
  return INSTATIC_ASSET_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix),
  );
}

export function isPublicRoute(pathname: string): boolean {
  if (isPublicAuthPath(pathname)) return true;
  if (isInstaticAssetPath(pathname)) return true;
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname.startsWith(prefix) || pathname === prefix.slice(0, -1)
  );
}

export function isFacebookAdsPath(pathname: string): boolean {
  return pathname === "/facebook-ads" || pathname.startsWith("/facebook-ads/");
}

/** BE password rule: 6+ chars, at least one digit and one uppercase letter */
export const PASSWORD_REGEX = /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i;