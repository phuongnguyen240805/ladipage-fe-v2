import { getPlatformAuthHeaders } from "@/lib/platform-auth.client";

export async function createLabPreviewUrl(pageId: string): Promise<string | null> {
  if (typeof window === "undefined" || !pageId.trim()) return null;
  const authHeaders = await getPlatformAuthHeaders({ preferNest: true });
  const response = await fetch(`/api/landing-pages/${encodeURIComponent(pageId)}/lab-preview`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeaders,
    },
    credentials: "include",
  });
  if (!response.ok) return null;
  const body = (await response.json().catch(() => null)) as { previewUrl?: unknown } | null;
  return typeof body?.previewUrl === "string" ? body.previewUrl : null;
}
