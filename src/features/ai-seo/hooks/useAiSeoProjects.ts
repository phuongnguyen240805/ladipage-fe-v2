import { useQuery } from "@tanstack/react-query";
import { fetchAiSeoProjects } from "../api/aiSeoProjects.api";
import { useAiSeoOrgId } from "./useAiSeoOrgId";

export function useAiSeoProjects(orgId?: string) {
  const resolvedOrgId = useAiSeoOrgId();
  const effectiveOrgId = orgId ?? resolvedOrgId;

  return useQuery({
    queryKey: ["ai-seo-projects", { orgId: effectiveOrgId }],
    queryFn: () => fetchAiSeoProjects(effectiveOrgId),
    refetchInterval: 15000,
  });
}
