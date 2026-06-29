export async function fetchGscConnectUrl(
  projectId: string,
  orgId = "org-1"
): Promise<{ url: string }> {
  const res = await fetch(`/api/ai-seo/integrations/google/gsc/connect-url?projectId=${projectId}`, {
    headers: { "x-org-id": orgId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Google Search Console connection URL");
  }
  return res.json();
}

export async function fetchGbpConnectUrl(
  projectId: string,
  orgId = "org-1"
): Promise<{ url: string }> {
  const res = await fetch(`/api/ai-seo/integrations/google/gbp/connect-url?projectId=${projectId}`, {
    headers: { "x-org-id": orgId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Google Business Profile connection URL");
  }
  return res.json();
}
