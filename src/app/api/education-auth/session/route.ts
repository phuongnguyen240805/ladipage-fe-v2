import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/backend/client.server";
import {
  copyEducationResponseHeaders,
  fetchEducationBackend,
} from "@/lib/education/education-backend.server";
import {
  clearEducationSessionCookies,
  readEducationAccessToken,
  sanitizeEducationAuthPayload,
} from "@/lib/education/education-session.server";

export async function GET(request: NextRequest) {
  const accessToken = readEducationAccessToken(request);
  if (!accessToken) {
    return NextResponse.json(
      { message: "Education session not found" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const upstream = await fetchEducationBackend(request, "api/auth/me", {
      accessToken,
      method: "GET",
    });
    const headers = copyEducationResponseHeaders(upstream);
    headers.set("Cache-Control", "no-store");
    const text = await upstream.text();
    if (!text) return new NextResponse(null, { status: upstream.status, headers });
    try {
      const payload = sanitizeEducationAuthPayload(JSON.parse(text) as unknown);
      return NextResponse.json(payload, { status: upstream.status, headers });
    } catch {
      return NextResponse.json(
        { message: "Invalid education session response" },
        { status: upstream.ok ? 502 : upstream.status, headers },
      );
    }
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { message: timedOut ? "Education session check timed out" : "Education backend unavailable" },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  // The legacy education API has no repository-owned revocation contract.
  // Clear only the BFF-held browser session rather than guessing an upstream
  // logout method/path and risking a state-changing call to the wrong route.
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearEducationSessionCookies(response);
  return response;
}
