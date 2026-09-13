import { NextRequest, NextResponse } from "next/server";
import { bridgeLegacyAccessToken } from "@/lib/backend/auth.server";
import { isSameOriginMutation } from "@/lib/backend/client.server";

/**
 * Compatibility bridge for the extension iframe while the extension migrates
 * away from sending a Nest bearer snapshot. The token is validated server-side,
 * installed only as HttpOnly cookie, and is never persisted by the web app.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token || token.length > 16_384) {
    return NextResponse.json({ message: "Invalid bridge token" }, { status: 400 });
  }
  return bridgeLegacyAccessToken(request, token);
}
