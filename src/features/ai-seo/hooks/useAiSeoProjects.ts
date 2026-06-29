import { useQuery } from "@tanstack/react-query";
import { fetchAiSeoProjects } from "../api/aiSeoProjects.api";

export function useAiSeoProjects(orgId = "org-1") {
  return useQuery({
    queryKey: ["ai-seo-projects", { orgId }],
    queryFn: () => fetchAiSeoProjects(orgId),
    refetchInterval: 15000, // Refresh every 15s to keep dashboard current
  });
}
