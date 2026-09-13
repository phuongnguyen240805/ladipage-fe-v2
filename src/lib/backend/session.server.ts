import "server-only";

import { decodeJwt } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import {
  NEST_REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/features/auth/constants";
import type { TenantJwtContext } from "@liora/api-types";
import {
  EMPTY_BACKEND_SESSION,
  type BackendSessionSnapshot,
} from "./session-types";

export interface BackendTokenPair {
  token: string;
  refreshToken: string;
}

const DEFAULT_ACCESS_MAX_AGE_SEC = 24 * 60 * 60;
const DEFAULT_REFRESH_MAX_AGE_SEC = 30 * 24 * 60 * 60;
const SECURE_COOKIE = process.env.NODE_ENV === "production";

function decodeCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function readBackendAccessToken(request: NextRequest): string | null {
  return decodeCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export function readBackendRefreshToken(request: NextRequest): string | null {
  return decodeCookieValue(request.cookies.get(NEST_REFRESH_COOKIE_NAME)?.value);
}

function tenantFromPayload(payload: ReturnType<typeof decodeJwt>): TenantJwtContext {
  const tenantId =
    typeof payload.tenantId === "number"
      ? payload.tenantId
      : typeof payload.tenantId === "string" && /^\d+$/.test(payload.tenantId)
        ? Number(payload.tenantId)
        : undefined;
  const activeTenantId =
    typeof payload.activeTenantId === "number"
      ? payload.activeTenantId
      : typeof payload.activeTenantId === "string" && /^\d+$/.test(payload.activeTenantId)
        ? Number(payload.activeTenantId)
        : undefined;

  return {
    ...(typeof payload.organizationId === "string"
      ? { organizationId: payload.organizationId }
      : {}),
    ...(tenantId != null ? { tenantId } : {}),
    ...(activeTenantId != null ? { activeTenantId } : {}),
    ...(typeof payload.appCode === "string" ? { appCode: payload.appCode } : {}),
  };
}

export function snapshotFromAccessToken(token: string | null): BackendSessionSnapshot {
  if (!token) return EMPTY_BACKEND_SESSION;
  try {
    const payload = decodeJwt(token);
    const expiresAt = typeof payload.exp === "number" ? payload.exp : null;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt != null && expiresAt <= now) return EMPTY_BACKEND_SESSION;
    return {
      authenticated: true,
      expiresAt,
      tenant: tenantFromPayload(payload),
    };
  } catch {
    return EMPTY_BACKEND_SESSION;
  }
}

function maxAgeFromJwt(token: string, fallback: number): number {
  try {
    const payload = decodeJwt(token);
    if (typeof payload.exp !== "number") return fallback;
    const seconds = payload.exp - Math.floor(Date.now() / 1000);
    return Math.max(1, seconds);
  } catch {
    return fallback;
  }
}

export function setBackendSessionCookies(
  response: NextResponse,
  pair: BackendTokenPair,
): void {
  response.cookies.set(SESSION_COOKIE_NAME, pair.token, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFromJwt(pair.token, DEFAULT_ACCESS_MAX_AGE_SEC),
  });
  response.cookies.set(NEST_REFRESH_COOKIE_NAME, pair.refreshToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: DEFAULT_REFRESH_MAX_AGE_SEC,
  });
}

export function setBackendAccessCookie(
  response: NextResponse,
  accessToken: string,
): void {
  response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFromJwt(accessToken, DEFAULT_ACCESS_MAX_AGE_SEC),
  });
}

export function setBackendRefreshCookie(
  response: NextResponse,
  refreshToken: string,
): void {
  response.cookies.set(NEST_REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: DEFAULT_REFRESH_MAX_AGE_SEC,
  });
}

export function clearBackendSessionCookies(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(NEST_REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
