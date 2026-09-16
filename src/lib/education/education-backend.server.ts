import "server-only";

import type { NextRequest } from "next/server";
import { readEducationAccessToken } from "./education-session.server";

const DEFAULT_TIMEOUT_MS = 30_000;
const ALLOWED_REQUEST_HEADERS = ["accept", "content-type", "idempotency-key"] as const;
const ALLOWED_RESPONSE_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-language",
  "content-type",
  "etag",
  "last-modified",
] as const;

function educationBaseUrl(): string {
  const configured =
    process.env.EDUCATION_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) {
    throw new Error("Education backend is not configured");
  }

  const normalized = configured.replace(/\/$/, "");
  const parsed = new URL(normalized);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Education backend must use http or https");
  }
  return normalized;
}

function normalizePath(pathname: string): string {
  const path = pathname.replace(/^\/+/, "");
  if (!path || path.split("/").some((part) => part === "..")) {
    throw new Error("Invalid education backend path");
  }
  return path;
}

function educationUrl(pathname: string, search = ""): string {
  const base = educationBaseUrl();
  let path = normalizePath(pathname);
  // Accept either an origin (https://host) or an API-root base
  // (https://host/api) during the NEXT_PUBLIC_API_BASE_URL migration.
  if (base.endsWith("/api") && path.startsWith("api/")) {
    path = path.slice("api/".length);
  }
  return `${base}/${path}${search}`;
}

function requestHeaders(
  request: NextRequest,
  accessToken: string | null,
): Headers {
  const headers = new Headers();
  for (const name of ALLOWED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent.slice(0, 512));
  const clientIp = request.headers.get("cf-connecting-ip")?.trim();
  if (clientIp && clientIp.length <= 64) headers.set("x-forwarded-for", clientIp);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  return headers;
}

export function copyEducationResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  for (const name of ALLOWED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export async function fetchEducationBackend(
  request: NextRequest,
  pathname: string,
  options: {
    includeAuth?: boolean;
    accessToken?: string | null;
    method?: string;
    body?: BodyInit | null;
    timeoutMs?: number;
  } = {},
): Promise<Response> {
  const method = (options.method ?? request.method).toUpperCase();
  const accessToken = options.includeAuth === false
    ? null
    : options.accessToken ?? readEducationAccessToken(request);
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    let body = options.body;
    if (body === undefined && !["GET", "HEAD"].includes(method)) {
      const bytes = await request.arrayBuffer();
      body = bytes.byteLength > 0 ? bytes : undefined;
    }

    const attempts = ["GET", "HEAD"].includes(method) ? 2 : 1;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(
          educationUrl(pathname, request.nextUrl.search),
          {
            method,
            headers: requestHeaders(request, accessToken),
            body,
            cache: "no-store",
            redirect: "manual",
            signal: controller.signal,
          },
        );
        if (attempt < attempts && [502, 503, 504].includes(response.status)) {
          await response.body?.cancel().catch(() => undefined);
          continue;
        }
        return response;
      } catch (error) {
        if (attempt >= attempts || controller.signal.aborted) throw error;
      }
    }
    throw new Error("Education backend request failed");
  } finally {
    clearTimeout(timeout);
  }
}
