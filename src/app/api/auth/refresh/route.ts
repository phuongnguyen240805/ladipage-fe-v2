import { NextRequest, NextResponse } from "next/server";
import {
  NEST_REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/features/auth/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const SECURE = process.env.NODE_ENV === "production";

interface TokenPair {
  token: string;
  refreshToken: string;
}

function getSafeRedirectPath(request: NextRequest): string {
  const requestedPath = request.nextUrl.searchParams.get("redirect");
  if (
    !requestedPath ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//")
  ) {
    return "/";
  }
  return requestedPath;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  return origin === request.nextUrl.origin;
}

async function rotateBackendSession(refreshToken: string): Promise<TokenPair> {
  const refreshRes = await fetch(API_URL + "/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const raw = (await refreshRes.json().catch(() => null)) as unknown;
  const envelope = raw && typeof raw === "object"
    ? raw as {
        code?: number | string;
        message?: string;
        data?: Partial<TokenPair>;
        token?: string;
        refreshToken?: string;
      }
    : null;
  const session = envelope?.data ?? envelope;
  const code = envelope?.code == null ? refreshRes.status : Number(envelope.code);

  if (
    !refreshRes.ok ||
    (Number.isFinite(code) && code !== 200) ||
    !session?.token ||
    !session?.refreshToken
  ) {
    throw new Error(envelope?.message ?? "Nest session refresh failed");
  }

  return { token: session.token, refreshToken: session.refreshToken };
}

function setRotatedCookies(response: NextResponse, session: TokenPair): void {
  response.cookies.set(SESSION_COOKIE_NAME, session.token, {
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
    secure: SECURE,
  });
  response.cookies.set(NEST_REFRESH_COOKIE_NAME, session.refreshToken, {
    path: "/",
    maxAge: REFRESH_MAX_AGE,
    sameSite: "lax",
    secure: SECURE,
    httpOnly: true,
  });
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(NEST_REFRESH_COOKIE_NAME);
}

async function handleRefresh(request: NextRequest): Promise<TokenPair> {
  const refreshToken = request.cookies.get(NEST_REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) throw new Error("No backend refresh session");
  return rotateBackendSession(refreshToken);
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  try {
    const session = await handleRefresh(request);
    const response = NextResponse.json(
      { token: session.token },
      { headers: { "Cache-Control": "no-store" } },
    );
    setRotatedCookies(response, session);
    return response;
  } catch (error) {
    const response = NextResponse.json(
      { message: error instanceof Error ? error.message : "Session refresh failed" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
    clearAuthCookies(response);
    return response;
  }
}

export async function GET(request: NextRequest) {
  const redirectTo = getSafeRedirectPath(request);

  try {
    const session = await handleRefresh(request);
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    setRotatedCookies(response, session);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/signin", request.url));
    clearAuthCookies(response);
    return response;
  }
}
