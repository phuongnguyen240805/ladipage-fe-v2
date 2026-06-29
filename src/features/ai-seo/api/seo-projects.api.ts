import { SeoProject } from "../types";

const getHeaders = (orgId?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (orgId) {
    headers["x-org-id"] = orgId;
  }
  return headers;
};

export async function fetchSeoProjects(orgId: string): Promise<SeoProject[]> {
  const res = await fetch("/api/ai-seo/seo-projects", {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch SEO projects");
  return res.json();
}

export async function createSeoProject(
  orgId: string,
  projectId: string,
  domain: string
): Promise<SeoProject> {
  const res = await fetch("/api/ai-seo/seo-projects", {
    method: "POST",
    headers: getHeaders(orgId),
    body: JSON.stringify({ projectId, domain }),
  });
  if (!res.ok) throw new Error("Failed to create SEO project");
  return res.json();
}

export async function startAudit(
  orgId: string,
  seoProjectId: string
): Promise<{ jobId: string; status: string }> {
  const res = await fetch(`/api/ai-seo/seo-projects/${seoProjectId}/start-audit`, {
    method: "POST",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to start SEO audit job");
  return res.json();
}
