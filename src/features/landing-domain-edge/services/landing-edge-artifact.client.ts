import "server-only";

import { createHmac } from "node:crypto";

import type { EdgeSyncStatus } from "../types/domain-edge.types";

const EDGE_SIGNATURE_HEADER = "x-liora-edge-signature";
const EDGE_TIMESTAMP_HEADER = "x-liora-edge-timestamp";
const DEFAULT_EDGE_TIMEOUT_MS = 30_000;

export interface LandingEdgeRouteTarget {
  hostname: string;
  path: string;
  originSlug: string;
  originBaseUrl: string;
}

export interface LandingEdgeArtifactResult {
  edgeSyncStatus: EdgeSyncStatus;
  message: string;
  artifactKey?: string | null;
  contentHash?: string | null;
  /** False for deterministic 4xx/config/data errors; true for timeout/5xx/429. */
  retryable?: boolean;
}

type EdgeAdminAction = "publish" | "activate" | "unpublish";

function edgeAdminUrl(): string | null {
  const raw = process.env.LANDING_EDGE_ADMIN_URL?.trim();
  if (!raw) return null;
  const normalized = raw.replace(/\/$/, "");
  return normalized.endsWith("/__landing-edge/admin")
    ? normalized
    : `${normalized}/__landing-edge/admin`;
}

function edgeSecret(): string | null {
  const value = process.env.LANDING_EDGE_PUBLISH_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}

function sign(secret: string, timestamp: string, body: string): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

function normalizeErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === "string" && record.error.trim()) return record.error;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
  }
  return fallback;
}

async function callEdgeAdmin(
  action: EdgeAdminAction,
  payload: Record<string, unknown>,
): Promise<LandingEdgeArtifactResult> {
  const url = edgeAdminUrl();
  const secret = edgeSecret();
  if (!url || !secret) {
    return {
      edgeSyncStatus: "pending",
      message: "Landing edge artifact delivery is not configured",
    };
  }

  const body = JSON.stringify({ action, ...payload });
  const timestamp = String(Date.now());
  const signature = sign(secret, timestamp, body);
  const controller = new AbortController();
  const configuredTimeout = Number(process.env.LANDING_EDGE_ADMIN_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? Math.max(5_000, Math.min(configuredTimeout, 2 * 60_000))
    : DEFAULT_EDGE_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        [EDGE_TIMESTAMP_HEADER]: timestamp,
        [EDGE_SIGNATURE_HEADER]: signature,
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const raw: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        edgeSyncStatus: "error",
        message: normalizeErrorMessage(
          raw,
          `Landing edge admin failed (${response.status})`,
        ),
        retryable: response.status >= 500 || response.status === 429,
      };
    }

    const result = raw && typeof raw === "object"
      ? raw as Record<string, unknown>
      : {};
    return {
      edgeSyncStatus: "synced",
      message:
        typeof result.message === "string" && result.message.trim()
          ? result.message
          : `${action} synchronized`,
      artifactKey:
        typeof result.artifactKey === "string" ? result.artifactKey : null,
      contentHash:
        typeof result.artifactHash === "string"
          ? result.artifactHash
          : typeof result.contentHash === "string"
            ? result.contentHash
            : null,
    };
  } catch (error) {
    return {
      edgeSyncStatus: "error",
      message:
        error instanceof Error && error.name === "AbortError"
          ? "Landing edge admin request timed out"
          : error instanceof Error
            ? error.message
            : "Landing edge admin unavailable",
      retryable: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function publishLandingEdgeArtifact(input: {
  pageId: string;
  version: number;
  html: string;
  routes: LandingEdgeRouteTarget[];
}): Promise<LandingEdgeArtifactResult> {
  if (input.routes.length === 0) {
    return {
      edgeSyncStatus: "disabled",
      message: "No edge routes require immutable artifact delivery",
    };
  }
  return callEdgeAdmin("publish", input as unknown as Record<string, unknown>);
}

export async function activateLandingEdgeArtifact(input: {
  pageId: string;
  version: number;
  routes: LandingEdgeRouteTarget[];
}): Promise<LandingEdgeArtifactResult> {
  if (input.routes.length === 0) {
    return { edgeSyncStatus: "disabled", message: "No edge routes to activate" };
  }
  return callEdgeAdmin("activate", input as unknown as Record<string, unknown>);
}

export async function unpublishLandingEdgeRoutes(input: {
  pageId: string;
  routes: LandingEdgeRouteTarget[];
}): Promise<LandingEdgeArtifactResult> {
  if (input.routes.length === 0) {
    return { edgeSyncStatus: "disabled", message: "No edge routes to remove" };
  }
  return callEdgeAdmin("unpublish", input as unknown as Record<string, unknown>);
}
