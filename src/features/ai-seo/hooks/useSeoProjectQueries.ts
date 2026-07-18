import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSeoProjects, createSeoProject, startAudit } from "../api/seo-projects.api";
import type { AiSeoProjectListItem } from "../types";
import { useAiSeoUiStore } from "../stores/useAiSeoUiStore";

export function useSeoProjectsQuery(orgId: string) {
  return useQuery<AiSeoProjectListItem[]>({
    queryKey: ["ai-seo", "seo-projects", orgId],
    queryFn: () => fetchSeoProjects(orgId),
    enabled: !!orgId,
  });
}

export function useCreateSeoProjectMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, domain }: { projectId: string; domain: string }) =>
      createSeoProject(orgId, projectId, domain),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "seo-projects", orgId] });
      // Set active SEO project
      useAiSeoUiStore.getState().setSelectedSeoProjectId(data.id);
    },
  });
}

export function useStartAuditMutation(orgId: string) {
  const queryClient = useQueryClient();
  const setActiveJobId = useAiSeoUiStore((state) => state.setActiveJobId);
  
  return useMutation({
    mutationFn: (seoProjectId: string) => startAudit(orgId, seoProjectId),
    onSuccess: (data) => {
      // Set active job ID to begin polling
      setActiveJobId(data.jobId);
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "jobs", orgId, data.jobId] });
    },
  });
}
