import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import {
  isInstaticAssetPath,
  isPublicRoute,
  SESSION_COOKIE_NAME,
  NEST_REFRESH_COOKIE_NAME,
} from "@/features/auth/constants";
import {
  getFreeSiteDomain,
  isFreeSubdomainEnabled,
  resolveFreeSubdomainRewritePath,
} from "@/features/landing-domain-edge/services/free-subdomain.service";

function redirectToSignIn(request: NextRequest, pathname: string): NextResponse {
  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(signInUrl);
}

function getJwtExp(token: string): number | null {
  try {
    const payload = decodeJwt(token);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Plan A — free subdomain Host routing (local + same-app edge):
 *   Host: {slug}.{FREE_SITE_DOMAIN}  →  rewrite /p/{slug}
 * App mother host (localhost / app.*) is unchanged.
 */
function tryFreeSubdomainRewrite(request: NextRequest): NextResponse | null {
  if (!isFreeSubdomainEnabled()) return null;

  const base = getFreeSiteDomain();
  if (!base) return null;

  const host = request.headers.get("host") ?? "";
  const rewritePath = resolveFreeSubdomainRewritePath(
    host,
    request.nextUrl.pathname,
    { enabled: true, baseDomain: base },
  );
  if (!rewritePath) return null;

  const url = request.nextUrl.clone();
  url.pathname = rewritePath;
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const freeRewrite = tryFreeSubdomainRewrite(request);
  if (freeRewrite) return freeRewrite;

  if (isInstaticAssetPath(pathname) || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/")
  ) {
    return NextResponse.next();
  }

  const rawAccessCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasRefreshCookie = Boolean(
    request.cookies.get(NEST_REFRESH_COOKIE_NAME)?.value,
  );

  // Refresh is intentionally POST-only. When an HttpOnly refresh session is
  // available, let the page render and allow AuthProvider to rotate it through
  // the same-origin BFF. Middleware must never mutate session state via GET.
  if (!rawAccessCookie) {
    return hasRefreshCookie
      ? NextResponse.next()
      : redirectToSignIn(request, pathname);
  }

  let accessCookie = rawAccessCookie;
  try {
    accessCookie = decodeURIComponent(rawAccessCookie);
  } catch {
    // Cookie values emitted by Next normally need no decoding. Keep the raw
    // value if a legacy deployment wrote a non-URI-encoded token.
  }

  const exp = getJwtExp(accessCookie);
  if (!exp) {
    return hasRefreshCookie
      ? NextResponse.next()
      : redirectToSignIn(request, pathname);
  }

  const now = Math.floor(Date.now() / 1000);
  if (exp <= now && !hasRefreshCookie) {
    return redirectToSignIn(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!signin|signup|error-404|api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)",
  ],
};
