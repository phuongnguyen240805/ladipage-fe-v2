import { AiSeoProjectPage, WebsiteProject, WebsitePage, AiSeoPageScore, AiSeoPageTask } from "../types";

const getHeaders = (orgId?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (orgId) {
    headers["x-org-id"] = orgId;
  }
  return headers;
};

export async function fetchConnectedLandingPages(
  orgId: string,
  projectId: string
): Promise<AiSeoProjectPage[]> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/landing-pages`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch connected landing pages");
  return res.json();
}

export async function linkLandingPage(
  orgId: string,
  projectId: string,
  pageUrl: string,
  websitePageId?: string | null,
  source: 'internal' | 'external' = 'external'
): Promise<AiSeoProjectPage> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/landing-pages`, {
    method: "POST",
    headers: getHeaders(orgId),
    body: JSON.stringify({ pageUrl, websitePageId, source }),
  });
  if (!res.ok) throw new Error("Failed to link landing page");
  return res.json();
}

export async function unlinkLandingPage(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<void> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}`, {
    method: "DELETE",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to unlink landing page");
}

export async function scanLandingPage(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<{ jobId: string; status: string }> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}/scan`, {
    method: "POST",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to scan landing page");
  return res.json();
}

export async function fetchLandingPageScores(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<AiSeoPageScore> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}/scores`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch landing page scores");
  return res.json();
}

export async function fetchLandingPageTasks(
  orgId: string,
  projectId: string,
  pageId: string
): Promise<AiSeoPageTask[]> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}/landing-pages/${pageId}/tasks`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch landing page tasks");
  return res.json();
}

export async function fetchWebsiteProjects(orgId: string): Promise<WebsiteProject[]> {
  const res = await fetch(`/api/ai-seo/website-projects`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch website builder projects");
  return res.json();
}

export async function fetchWebsitePages(
  orgId: string,
  websiteProjectId: string
): Promise<WebsitePage[]> {
  const res = await fetch(`/api/ai-seo/website-projects/${websiteProjectId}/pages`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch website builder pages");
  return res.json();
}

export async function publishWebsitePage(
  orgId: string,
  websiteProjectId: string,
  pageId: string
): Promise<WebsitePage> {
  const res = await fetch(`/api/ai-seo/website-projects/${websiteProjectId}/pages/${pageId}/publish`, {
    method: "POST",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to publish website page");
  return res.json();
}

export async function connectWebsitePageToAiSeo(
  orgId: string,
  websiteProjectId: string,
  pageId: string,
  aiSeoProjectId: string
): Promise<AiSeoProjectPage> {
  const res = await fetch(`/api/ai-seo/website-projects/${websiteProjectId}/pages/${pageId}/connect-ai-seo`, {
    method: "POST",
    headers: getHeaders(orgId),
    body: JSON.stringify({ aiSeoProjectId }),
  });
  if (!res.ok) throw new Error("Failed to connect website page to AI SEO");
  return res.json();
}
