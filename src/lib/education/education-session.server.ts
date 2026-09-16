import "server-only";

import type { NextRequest, NextResponse } from "next/server";

const EDUCATION_ACCESS_COOKIE = "liora-education-access";
const EDUCATION_REFRESH_COOKIE = "liora-education-refresh";
const ONE_DAY_SECONDS = 24 * 60 * 60;
const SEVEN_DAYS_SECONDS = 7 * ONE_DAY_SECONDS;

export interface EducationTokenPair {
  accessToken: string;
  refreshToken?: string;
}

export function readEducationAccessToken(request: NextRequest): string | null {
  return request.cookies.get(EDUCATION_ACCESS_COOKIE)?.value ?? null;
}

export function readEducationRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(EDUCATION_REFRESH_COOKIE)?.value ?? null;
}

export function setEducationSessionCookies(
  response: NextResponse,
  pair: EducationTokenPair,
  remember: boolean,
): void {
  const maxAge = remember ? SEVEN_DAYS_SECONDS : ONE_DAY_SECONDS;
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };

  response.cookies.set(EDUCATION_ACCESS_COOKIE, pair.accessToken, options);
  if (pair.refreshToken) {
    response.cookies.set(EDUCATION_REFRESH_COOKIE, pair.refreshToken, options);
  } else {
    response.cookies.delete(EDUCATION_REFRESH_COOKIE);
  }
}

type JsonObject = Record<string, unknown>;

function objectValue(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : null;
}

function stripCredentialFields(value: JsonObject): JsonObject {
  const { accessToken: _access, refreshToken: _refresh, token: _token, password: _password, ...safe } = value;
  return safe;
}

/** Never serialize auth credentials from an upstream auth response to browser JS. */
export function sanitizeEducationAuthPayload(payload: unknown): unknown {
  const root = objectValue(payload);
  if (!root) return payload;
  const safeRoot = stripCredentialFields(root);
  const data = objectValue(root.data);
  return data ? { ...safeRoot, data: stripCredentialFields(data) } : safeRoot;
}

export function clearEducationSessionCookies(response: NextResponse): void {
  response.cookies.set(EDUCATION_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(EDUCATION_REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
