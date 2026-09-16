import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/backend/client.server";
import { fetchEducationBackend } from "@/lib/education/education-backend.server";
import {
  sanitizeEducationAuthPayload,
  setEducationSessionCookies,
} from "@/lib/education/education-session.server";

type JsonObject = Record<string, unknown>;

function objectValue(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : null;
}

function extractTokens(payload: unknown): {
  accessToken: string;
  refreshToken?: string;
} | null {
  const root = objectValue(payload);
  const data = objectValue(root?.data) ?? root;
  if (!data) return null;
  const accessToken = typeof data.accessToken === "string"
    ? data.accessToken
    : typeof data.token === "string"
      ? data.token
      : "";
  if (!accessToken) return null;
  const refreshToken = typeof data.refreshToken === "string"
    ? data.refreshToken
    : undefined;
  return { accessToken, ...(refreshToken ? { refreshToken } : {}) };
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  const input = objectValue(await request.json().catch(() => null));
  if (!input || typeof input.password !== "string") {
    return NextResponse.json({ message: "Invalid login request" }, { status: 400 });
  }
  const remember = input.remember === true;
  const upstreamBody = {
    ...(typeof input.username === "string" ? { username: input.username } : {}),
    ...(typeof input.email === "string" ? { email: input.email } : {}),
    password: input.password,
  };

  try {
    const upstream = await fetchEducationBackend(request, "api/auth/login", {
      includeAuth: false,
      method: "POST",
      body: JSON.stringify(upstreamBody),
    });
    const text = await upstream.text();
    const payload = text ? JSON.parse(text) as unknown : null;
    const pair = upstream.ok ? extractTokens(payload) : null;
    const safePayload = sanitizeEducationAuthPayload(payload);

    if (upstream.ok && !pair) {
      return NextResponse.json(
        { message: "Education backend returned an invalid session response" },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const response = NextResponse.json(safePayload, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
    if (pair) setEducationSessionCookies(response, pair, remember);
    return response;
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { message: timedOut ? "Education login timed out" : "Education backend unavailable" },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
