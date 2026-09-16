import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/backend/client.server";
import {
  copyEducationResponseHeaders,
  fetchEducationBackend,
} from "@/lib/education/education-backend.server";

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
  if (!path.length || path.some((part) => !part || part === "." || part === "..")) {
    return NextResponse.json({ message: "Invalid education API path" }, { status: 400 });
  }
  if (path[0] === "auth") {
    return NextResponse.json(
      { message: "Education auth routes use the dedicated BFF" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const upstream = await fetchEducationBackend(
      request,
      `api/${path.join("/")}`,
    );
    const headers = copyEducationResponseHeaders(upstream);
    // Authenticated education responses must never be cached by shared/browser caches.
    headers.set("Cache-Control", "no-store");
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { message: timedOut ? "Education request timed out" : "Education backend unavailable" },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
