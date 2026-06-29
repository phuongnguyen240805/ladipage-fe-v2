import { SeoTask } from "../types";

const getHeaders = (orgId?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (orgId) {
    headers["x-org-id"] = orgId;
  }
  return headers;
};

export async function fetchSeoTasks(
  orgId: string,
  seoProjectId: string
): Promise<SeoTask[]> {
  const res = await fetch(`/api/ai-seo/seo-projects/${seoProjectId}/tasks`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch SEO tasks");
  return res.json();
}

export async function updateSeoTask(
  orgId: string,
  taskId: string,
  status: 'todo' | 'in_progress' | 'completed'
): Promise<SeoTask> {
  const res = await fetch(`/api/ai-seo/seo-tasks/${taskId}`, {
    method: "PATCH",
    headers: getHeaders(orgId),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update task status");
  return res.json();
}

export async function approveSeoTask(orgId: string, taskId: string): Promise<any> {
  const res = await fetch(`/api/ai-seo/seo-tasks/${taskId}/approve`, {
    method: "POST",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to approve task");
  return res.json();
}

export async function rejectSeoTask(orgId: string, taskId: string): Promise<any> {
  const res = await fetch(`/api/ai-seo/seo-tasks/${taskId}/reject`, {
    method: "POST",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to reject task");
  return res.json();
}

export async function deploySeoTask(orgId: string, taskId: string): Promise<any> {
  const res = await fetch(`/api/ai-seo/seo-tasks/${taskId}/deploy`, {
    method: "POST",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to deploy task");
  return res.json();
}
