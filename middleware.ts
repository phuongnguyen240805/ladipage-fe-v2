import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import {
  isInstaticAssetPath,
  isPublicRoute,
  SESSION_COOKIE_NAME,
  SB_REFRESH_COOKIE_NAME,
} from "@/features/auth/constants";

const JWT_REFRESH_BUFFER_SEC = 60;

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Instatic Vite/CMS proxies first — never redirect modules to /signin or refresh.
  if (isInstaticAssetPath(pathname)) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/")
  ) {
    return NextResponse.next();
  }

  const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!rawCookie) {
    return redirectToSignIn(request, pathname);
  }

  let sessionCookie = rawCookie;
  try {
    sessionCookie = decodeURIComponent(rawCookie);
  } catch {
    sessionCookie = rawCookie;
  }

  const exp = getJwtExp(sessionCookie);
  if (!exp) {
    return redirectToSignIn(request, pathname);
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = exp - now;

  if (secondsLeft <= 0) {
    const sbRefresh = request.cookies.get(SB_REFRESH_COOKIE_NAME)?.value;
    if (sbRefresh) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(refreshUrl);
    }
    return redirectToSignIn(request, pathname);
  }

  if (secondsLeft < JWT_REFRESH_BUFFER_SEC) {
    const sbRefresh = request.cookies.get(SB_REFRESH_COOKIE_NAME)?.value;
    if (sbRefresh) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(refreshUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    // Still match extensionless Instatic paths (/@vite/client, /admin/site).
    // Paths with a file extension (*.tsx, *.js) skip middleware via negative lookahead —
    // they rely on next.config beforeFiles rewrites only.
    "/((?!signin|signup|error-404|api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)",
  ],
};