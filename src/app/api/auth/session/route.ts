import { NextRequest, NextResponse } from "next/server";
import {
  NEST_REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/features/auth/constants";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const SECURE = process.env.NODE_ENV === "production";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  return origin === request.nextUrl.origin;
}

function setAuthCookies(
  response: NextResponse,
  token: string,
  refreshToken: string,
): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
    secure: SECURE,
  });
  response.cookies.set(NEST_REFRESH_COOKIE_NAME, refreshToken, {
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

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  const refreshToken = request.cookies.get(NEST_REFRESH_COOKIE_NAME)?.value;
  const response = NextResponse.json(
    { token },
    { headers: { "Cache-Control": "no-store" } },
  );

  // Upgrade a pre-hardening JS-readable refresh cookie to HttpOnly on first bootstrap.
  if (refreshToken) {
    response.cookies.set(NEST_REFRESH_COOKIE_NAME, refreshToken, {
      path: "/",
      maxAge: REFRESH_MAX_AGE,
      sameSite: "lax",
      secure: SECURE,
      httpOnly: true,
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { token?: unknown; refreshToken?: unknown }
    | null;
  const token = typeof body?.token === "string" ? body.token : "";
  const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";

  if (!token || !refreshToken) {
    return NextResponse.json({ message: "Incomplete auth token pair" }, { status: 400 });
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  setAuthCookies(response, token, refreshToken);
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearAuthCookies(response);
  return response;
}
