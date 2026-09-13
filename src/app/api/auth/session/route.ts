import { NextRequest, NextResponse } from "next/server";
import {
  clearBackendSessionCookies,
  revokeBackendSession,
} from "@/lib/backend/auth.server";
import { isSameOriginMutation } from "@/lib/backend/client.server";
import {
  readBackendAccessToken,
  readBackendRefreshToken,
  setBackendAccessCookie,
  setBackendRefreshCookie,
  snapshotFromAccessToken,
} from "@/lib/backend/session.server";

export async function GET(request: NextRequest) {
  const accessToken = readBackendAccessToken(request);
  const refreshToken = readBackendRefreshToken(request);
  const snapshot = snapshotFromAccessToken(accessToken);
  const response = NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });

  // One-time migration for sessions created before the hardening cutover:
  // overwrite legacy JS-readable cookies with the same values as HttpOnly.
  if (accessToken && snapshot.authenticated) {
    setBackendAccessCookie(response, accessToken);
  }
  if (refreshToken) {
    setBackendRefreshCookie(response, refreshToken);
  }
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  await revokeBackendSession(request);
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearBackendSessionCookies(response);
  return response;
}
