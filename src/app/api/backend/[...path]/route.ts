import { NextRequest, NextResponse } from "next/server";
import {
  copyBackendResponseHeaders,
  fetchBackend,
  isSameOriginMutation,
} from "@/lib/backend/client.server";

const BLOCKED_BACKEND_PATHS = new Set([
  "account/reissue-token",
  "account/logout",
]);

const DEFAULT_BACKEND_TIMEOUT_MS = 30_000;
const CUSTOMER_CARE_AI_TIMEOUT_MS = 120_000;
const AI_SEO_LAB_SCAN_TIMEOUT_MS = 220_000;

function isBlockedBackendPath(path: string): boolean {
  return path === "auth" || path.startsWith("auth/") || BLOCKED_BACKEND_PATHS.has(path);
}

/**
 * Compatibility budget for the two synchronous long-running endpoints that
 * already existed before the BFF cutover. New long work should return a job id
 * and run asynchronously instead of extending this list.
 */
function backendTimeoutMs(path: string, method: string): number {
  if (
    method === "POST" &&
    /^customer-care\/conversations\/[^/]+\/ai\/(reply|analyze)$/.test(path)
  ) {
    return CUSTOMER_CARE_AI_TIMEOUT_MS;
  }
  if (method === "POST" && path === "ai-seo/lab-scans") {
    return AI_SEO_LAB_SCAN_TIMEOUT_MS;
  }
  return DEFAULT_BACKEND_TIMEOUT_MS;
}

async function proxy(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { path } = await props.params;
  const backendPath = path.join("/");
  if (isBlockedBackendPath(backendPath)) {
    return NextResponse.json(
      { message: "Backend path is not available through the generic BFF" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const upstream = await fetchBackend(request, backendPath, {
      timeoutMs: backendTimeoutMs(backendPath, request.method),
    });
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: copyBackendResponseHeaders(upstream),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { message: timedOut ? "Backend request timed out" : "Backend unavailable" },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
