import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "./client.server";
import {
  clearBackendSessionCookies,
  readBackendAccessToken,
  readBackendRefreshToken,
  setBackendAccessCookie,
  setBackendSessionCookies,
  snapshotFromAccessToken,
  type BackendTokenPair,
} from "./session.server";
import type { BackendSessionSnapshot } from "./session-types";

interface Envelope<T> {
  code?: number | string;
  message?: string;
  data?: T;
}

function tokenPairFromPayload(payload: unknown): BackendTokenPair | null {
  if (!payload || typeof payload !== "object") return null;
  const envelope = payload as Envelope<Partial<BackendTokenPair>> & Partial<BackendTokenPair>;
  const value = envelope.data ?? envelope;
  const token = typeof value.token === "string" ? value.token : "";
  const refreshToken = typeof value.refreshToken === "string" ? value.refreshToken : "";
  return token && refreshToken ? { token, refreshToken } : null;
}

function replaceEnvelopeData(payload: unknown, data: BackendSessionSnapshot): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return { ...(payload as Record<string, unknown>), data };
  }
  return data;
}

export async function proxyAuthRoute(
  request: NextRequest,
  backendPath: string,
  options: { captureSession?: boolean } = {},
): Promise<NextResponse> {
  const upstream = await fetchBackend(request, backendPath, { includeAuth: false });
  const text = await upstream.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Keep non-JSON auth responses intact.
  }

  if (!options.captureSession || !upstream.ok) {
    return new NextResponse(
      typeof payload === "string" ? payload : JSON.stringify(payload),
      {
        status: upstream.status,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
      },
    );
  }

  const pair = tokenPairFromPayload(payload);
  if (!pair) {
    return NextResponse.json(
      { message: "Backend returned an invalid session response" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const snapshot = snapshotFromAccessToken(pair.token);
  const response = NextResponse.json(replaceEnvelopeData(payload, snapshot), {
    status: upstream.status,
    headers: { "Cache-Control": "no-store" },
  });
  setBackendSessionCookies(response, pair);
  return response;
}

export async function rotateBackendSession(
  request: NextRequest,
): Promise<{ response: NextResponse; snapshot: BackendSessionSnapshot | null }> {
  const refreshToken = readBackendRefreshToken(request);
  if (!refreshToken) {
    return {
      response: NextResponse.json(
        { authenticated: false, expiresAt: null, tenant: {} },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      ),
      snapshot: null,
    };
  }

  const refreshRequest = new NextRequest(request.url, {
    method: "POST",
    headers: new Headers({
      "content-type": "application/json",
      origin: request.nextUrl.origin,
      ...(request.headers.get("user-agent")
        ? { "user-agent": request.headers.get("user-agent")! }
        : {}),
      ...(request.headers.get("cf-connecting-ip")
        ? { "cf-connecting-ip": request.headers.get("cf-connecting-ip")! }
        : {}),
    }),
    body: JSON.stringify({ refreshToken }),
  });

  const upstream = await fetchBackend(refreshRequest, "auth/refresh", {
    includeAuth: false,
    search: "",
  });
  const payload = (await upstream.json().catch(() => null)) as unknown;
  const pair = upstream.ok ? tokenPairFromPayload(payload) : null;
  if (!pair) {
    // Do not clear cookies here: another browser tab may have completed the
    // single-use rotation first and already installed the new cookie pair.
    return {
      response: NextResponse.json(
        { authenticated: false, expiresAt: null, tenant: {} },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      ),
      snapshot: null,
    };
  }

  const snapshot = snapshotFromAccessToken(pair.token);
  const response = NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
  setBackendSessionCookies(response, pair);
  return { response, snapshot };
}

export async function reissueBackendSession(request: NextRequest): Promise<NextResponse> {
  const accessToken = readBackendAccessToken(request);
  if (!accessToken) {
    return NextResponse.json(
      { authenticated: false, expiresAt: null, tenant: {} },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const upstream = await fetchBackend(request, "account/reissue-token", {
    method: "POST",
    accessToken,
    search: "",
  });
  const payload = (await upstream.json().catch(() => null)) as unknown;
  const pair = upstream.ok ? tokenPairFromPayload(payload) : null;
  if (!pair) {
    return NextResponse.json(
      { message: "Unable to reissue backend session" },
      { status: upstream.status || 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const snapshot = snapshotFromAccessToken(pair.token);
  const response = NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
  setBackendSessionCookies(response, pair);
  return response;
}

export async function bridgeLegacyAccessToken(
  request: NextRequest,
  token: string,
): Promise<NextResponse> {
  const bridgeRequest = new NextRequest(request.url, {
    method: "GET",
    headers: request.headers,
  });
  const upstream = await fetchBackend(bridgeRequest, "account/profile", {
    method: "GET",
    accessToken: token,
    search: "",
  });
  if (!upstream.ok) {
    return NextResponse.json(
      { authenticated: false, expiresAt: null, tenant: {} },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const snapshot = snapshotFromAccessToken(token);
  const response = NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
  setBackendAccessCookie(response, token);
  return response;
}

export async function revokeBackendSession(request: NextRequest): Promise<void> {
  const accessToken = readBackendAccessToken(request);
  if (!accessToken) return;
  await fetchBackend(request, "account/logout", {
    method: "GET",
    accessToken,
    search: "",
    timeoutMs: 5_000,
  }).catch(() => undefined);
}

export { clearBackendSessionCookies };
