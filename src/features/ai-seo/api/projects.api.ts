import { Project } from "../types";

const getHeaders = (orgId?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (orgId) {
    headers["x-org-id"] = orgId;
  }
  return headers;
};

export async function fetchProjects(orgId: string): Promise<Project[]> {
  const res = await fetch(`/api/ai-seo/projects?orgId=${orgId}`, {
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(orgId: string, name: string): Promise<Project> {
  const res = await fetch("/api/ai-seo/projects", {
    method: "POST",
    headers: getHeaders(orgId),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function updateProject(orgId: string, projectId: string, name: string): Promise<Project> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}`, {
    method: "PATCH",
    headers: getHeaders(orgId),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function deleteProject(orgId: string, projectId: string): Promise<void> {
  const res = await fetch(`/api/ai-seo/projects/${projectId}`, {
    method: "DELETE",
    headers: getHeaders(orgId),
  });
  if (!res.ok) throw new Error("Failed to delete project");
}
