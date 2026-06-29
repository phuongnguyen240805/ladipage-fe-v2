export async function fetchJobDetails(jobId: string, orgId = "org-1"): Promise<any> {
  const res = await fetch(`/api/ai-seo/jobs/${jobId}`, {
    headers: { "x-org-id": orgId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch job details");
  }
  return res.json();
}

export async function fetchJobEvents(jobId: string, orgId = "org-1"): Promise<any[]> {
  const res = await fetch(`/api/ai-seo/jobs/${jobId}/events`, {
    headers: { "x-org-id": orgId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch job events");
  }
  return res.json();
}
