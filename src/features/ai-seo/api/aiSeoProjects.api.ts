import { AiSeoProjectListItem } from "../types";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const sb = getSupabaseClient();
    if (!sb) return { "Content-Type": "application/json" };
    const { data } = await sb.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {}
  return { "Content-Type": "application/json" };
}

export async function fetchAiSeoProjects(_orgId = "org-1"): Promise<AiSeoProjectListItem[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ai-seo/projects`, { headers });
  if (!res.ok) {
    throw new Error("Failed to fetch AI SEO projects");
  }
  return res.json();
}

export async function createAiSeoProject(
  data: { name: string; hostname: string },
  _orgId = "org-1"
): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ai-seo/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create project");
  }
  return res.json();
}

export async function toggleFavoriteProject(
  projectId: string,
  _orgId = "org-1"
): Promise<{ id: string; projectId: string; isFavorite: boolean }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ai-seo/projects/${projectId}/favorite`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) {
    throw new Error("Failed to update favorite status");
  }
  return res.json();
}

export async function toggleAgentStatus(
  projectId: string,
  _orgId = "org-1"
): Promise<{ id: string; projectId: string; isEngaged: boolean }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ai-seo/projects/${projectId}/agent-status`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) {
    throw new Error("Failed to update agent status");
  }
  return res.json();
}

export async function triggerProjectScan(
  projectId: string,
  _orgId = "org-1"
): Promise<{ jobId: string; status: string }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ai-seo/projects/${projectId}/scan`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    throw new Error("Failed to trigger scan");
  }
  return res.json();
}

export async function deleteProject(
  projectId: string,
  _orgId = "org-1"
): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/ai-seo/projects/${projectId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    throw new Error("Failed to delete project");
  }
  return res.json();
}
