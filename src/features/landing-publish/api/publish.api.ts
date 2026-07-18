import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";

import type { PublishLandingPageRequest, PublishResult, UnpublishResult } from "../types/publish.types";

function usePublishApiV2(): boolean {
  const mode = process.env.NEXT_PUBLIC_PUBLISH_API ?? "v2";
  return mode !== "legacy";
}

export function isPublishApiV2Enabled(): boolean {
  return usePublishApiV2();
}

export async function publishLandingPageApi(
  pageId: string,
  body?: PublishLandingPageRequest,
): Promise<PublishResult> {
  if (!usePublishApiV2()) {
    throw new Error("Legacy publish path is disabled in the editor. Set NEXT_PUBLIC_PUBLISH_API=v2.");
  }

  // BFF → Nest AI-SEO sync requires Nest JWT. Prefer nestToken over Supabase.
  const authHeaders = await getPlatformAuthHeaders({ preferNest: true });

  const response = await fetch(`/api/landing-pages/${pageId}/publish`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Publish failed.");
  }

  return payload as PublishResult;
}

export async function unpublishLandingPageApi(pageId: string): Promise<UnpublishResult> {
  const authHeaders = await getPlatformAuthHeaders({ preferNest: true });
  const response = await fetch(`/api/landing-pages/${pageId}/publish`, {
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
