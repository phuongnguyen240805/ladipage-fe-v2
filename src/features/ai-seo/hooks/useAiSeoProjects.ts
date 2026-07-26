import { useQuery } from "@tanstack/react-query";
import { fetchAiSeoProjects } from "../api/aiSeoProjects.api";
import { useAiSeoOrgId } from "./useAiSeoOrgId";

export function useAiSeoProjects(orgId?: string) {
  const resolvedOrgId = useAiSeoOrgId();
  const effectiveOrgId = orgId ?? resolvedOrgId;

  return useQuery({
    queryKey: ["ai-seo-projects", { orgId: effectiveOrgId }],
    queryFn: () => fetchAiSeoProjects(effectiveOrgId),
    // Poll only while a project is mid-scan; otherwise stop to avoid throttling
    // the API (each card also polls its landing pages). 15s → 30s when idle.
    refetchInterval: (query) => {
      const projects = query.state.data;
      const scanning =
        Array.isArray(projects) &&
        projects.some((p) => p.taskStatus === "started");
      return scanning ? 15000 : 30000;
    },
  });
}
