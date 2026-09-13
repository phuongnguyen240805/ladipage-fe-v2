import "server-only";

import type { NextRequest } from "next/server";
import { readBackendAccessToken } from "./session.server";

const DEFAULT_BACKEND_URL = "http://localhost:7002/api";
const DEFAULT_TIMEOUT_MS = 30_000;
const ALLOWED_REQUEST_HEADERS = [
  "accept",
  "content-type",
  "idempotency-key",
  "x-idempotency-key",
] as const;
const ALLOWED_RESPONSE_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-language",
  "content-type",
  "etag",
  "last-modified",
] as const;

export function backendBaseUrl(): string {
  return (
    process.env.NEST_INTERNAL_URL ??
    process.env.LADIPAGE_BACKEND_API_URL ??
    DEFAULT_BACKEND_URL
  ).replace(/\/$/, "");
}

function normalizeBackendPath(pathname: string): string {
  const normalized = pathname.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error("Invalid backend path");
  }
  return normalized;
}

export function buildBackendUrl(pathname: string, search = ""): string {
  return `${backendBaseUrl()}/${normalizeBackendPath(pathname)}${search}`;
}

function requestId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < values.length; index += 1) {
      values[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function traceparent(): string {
  return `00-${randomHex(16)}-${randomHex(8)}-01`;
}

function trustedClientIp(request: NextRequest): string | null {
  const value = request.headers.get("cf-connecting-ip")?.trim();
  return value && value.length <= 64 ? value : null;
}

export function buildBackendHeaders(
  request: NextRequest,
  options: { accessToken?: string | null; includeAuth?: boolean } = {},
): Headers {
  const headers = new Headers();
  for (const name of ALLOWED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  headers.set("x-request-id", requestId());
  // Start a server-owned trace at the BFF boundary. Browser-supplied trace
  // headers are intentionally not forwarded across the trust boundary.
  headers.set("traceparent", traceparent());

  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent.slice(0, 512));

  const ip = trustedClientIp(request);
  if (ip) headers.set("x-forwarded-for", ip);

  if (options.includeAuth !== false) {
    const accessToken = options.accessToken ?? readBackendAccessToken(request);
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export function copyBackendResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  for (const name of ALLOWED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export function isMutationMethod(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

export function isSameOriginMutation(request: NextRequest): boolean {
  if (!isMutationMethod(request.method)) return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === request.nextUrl.origin;
}

export async function fetchBackend(
  request: NextRequest,
  pathname: string,
  options: {
    accessToken?: string | null;
    includeAuth?: boolean;
    method?: string;
    search?: string;
    timeoutMs?: number;
  } = {},
): Promise<Response> {
  const method = (options.method ?? request.method).toUpperCase();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    let body: ArrayBuffer | undefined;
    if (!["GET", "HEAD"].includes(method)) {
      body = await request.arrayBuffer();
    }

    const url = buildBackendUrl(pathname, options.search ?? request.nextUrl.search);
    const headers = buildBackendHeaders(request, options);
    const maxAttempts = ["GET", "HEAD"].includes(method) ? 2 : 1;
    const retryableStatus = new Set([502, 503, 504]);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body && body.byteLength > 0 ? body : undefined,
          cache: "no-store",
          redirect: "manual",
          signal: controller.signal,
        });
        if (attempt < maxAttempts && retryableStatus.has(response.status)) {
          await response.body?.cancel().catch(() => undefined);
          await new Promise((resolve) =>
            setTimeout(resolve, 75 + Math.floor(Math.random() * 100)),
          );
          continue;
        }
        return response;
      } catch (error) {
        if (attempt >= maxAttempts || controller.signal.aborted) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, 75 + Math.floor(Math.random() * 100)),
        );
      }
    }

    throw new Error("Backend request failed");
  } finally {
    clearTimeout(timeout);
  }
}
