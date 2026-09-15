import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";

import type {
  PublishLandingPageRequest,
  PublishResult,
  UnpublishResult,
} from "../types/publish.types";

const PUBLISH_WAIT_TIMEOUT_MS = 180_000;
const POLL_DELAYS_MS = [700, 1_000, 1_400, 2_000, 2_500, 3_000] as const;

type PublishJobResponse = {
  jobId: string;
  pageId: string;
  status:
    | "queued"
    | "validating"
    | "rendering"
    | "writing_artifact"
    | "updating_route"
    | "published"
    | "failed_retryable"
    | "failed_final"
    | "cancelled";
  step?: string;
  progress?: number;
  result?: PublishResult | null;
  error?: { code?: string | null; message?: string | null } | null;
};

function usePublishApiV2(): boolean {
  const mode = process.env.NEXT_PUBLIC_PUBLISH_API ?? "v2";
  return mode !== "legacy";
}

export function isPublishApiV2Enabled(): boolean {
  return usePublishApiV2();
}

function publishIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `publish-${crypto.randomUUID()}`;
  }
  return `publish-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPublishJob(
  pageId: string,
  initial: PublishJobResponse,
  authHeaders: Record<string, string>,
): Promise<PublishResult> {
  const startedAt = Date.now();
  let attempt = 0;
  let current = initial;
  let transientFailures = 0;

  while (Date.now() - startedAt < PUBLISH_WAIT_TIMEOUT_MS) {
    if (current.status === "published" && current.result) {
      return current.result;
    }
    if (current.status === "failed_final" || current.status === "cancelled") {
      throw new Error(
        current.error?.message ||
          (current.status === "cancelled"
            ? "This publish was superseded by a newer publish request."
            : "Publish failed."),
      );
    }

    const delay = POLL_DELAYS_MS[Math.min(attempt, POLL_DELAYS_MS.length - 1)];
    await sleep(delay);
    attempt += 1;

    const response = await fetch(
      `/api/landing-pages/${encodeURIComponent(pageId)}/publish?jobId=${encodeURIComponent(current.jobId)}`,
      {
        method: "GET",
        headers: authHeaders,
        credentials: "include",
        cache: "no-store",
      },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if ([502, 503, 504].includes(response.status) && transientFailures < 3) {
        transientFailures += 1;
        continue;
      }
      throw new Error(payload?.error || "Could not read publish status.");
    }
    transientFailures = 0;
    current = payload as PublishJobResponse;
  }

  throw new Error(
    "Publish is still processing. The job was not cancelled; refresh the page before publishing again.",
  );
}

export async function publishLandingPageApi(
  pageId: string,
  body?: PublishLandingPageRequest,
): Promise<PublishResult> {
  if (!usePublishApiV2()) {
    throw new Error("Legacy publish path is disabled in the editor. Set NEXT_PUBLIC_PUBLISH_API=v2.");
  }

  // The same-origin route owns backend authentication; browser code sends no bearer token.
  const authHeaders = await getPlatformAuthHeaders({ preferNest: true });
  const response = await fetch(`/api/landing-pages/${encodeURIComponent(pageId)}/publish`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "content-type": "application/json",
      "idempotency-key": publishIdempotencyKey(),
    },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Publish failed.");
  }

  if (response.status === 202 && typeof payload?.jobId === "string") {
    return waitForPublishJob(pageId, payload as PublishJobResponse, authHeaders);
  }
  return payload as PublishResult;
}

export async function unpublishLandingPageApi(pageId: string): Promise<UnpublishResult> {
  const authHeaders = await getPlatformAuthHeaders({ preferNest: true });
  const response = await fetch(`/api/landing-pages/${encodeURIComponent(pageId)}/publish`, {
    method: "DELETE",
    headers: authHeaders,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unpublish failed.");
  }

  return payload as UnpublishResult;
}
