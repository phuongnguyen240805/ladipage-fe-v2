import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleFavoriteProject,
  toggleAgentStatus,
  triggerProjectScan,
  deleteProject,
} from "../api/aiSeoProjects.api";
import { AiSeoProjectListItem } from "../types";

export function useAiSeoProjectMutations(orgId = "org-1") {
  const queryClient = useQueryClient();
  const queryKey = ["ai-seo-projects", { orgId }];

  // 1. Favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: (projectId: string) => toggleFavoriteProject(projectId, orgId),
    onMutate: async (projectId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous state
      const previous = queryClient.getQueryData<AiSeoProjectListItem[]>(queryKey);

      // Optimistically update the favorite state
      if (previous) {
        queryClient.setQueryData<AiSeoProjectListItem[]>(
          queryKey,
          previous.map((p) =>
            p.id === projectId || p.projectId === projectId
              ? { ...p, isFavorite: !p.isFavorite }
              : p
          )
        );
      }

      return { previous };
    },
    onError: (err, projectId, context: any) => {
      // Rollback to previous state on error
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 2. Agent toggling mutation (Engaged/Disengaged)
  const agentToggleMutation = useMutation({
    mutationFn: (projectId: string) => toggleAgentStatus(projectId, orgId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<AiSeoProjectListItem[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<AiSeoProjectListItem[]>(
          queryKey,
          previous.map((p) =>
            p.id === projectId || p.projectId === projectId
              ? {
                  ...p,
                  agentStatus: p.agentStatus === "engaged" ? "disengaged" : "engaged",
                }
              : p
          )
        );
      }

      return { previous };
    },
    onError: (err, projectId, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 3. Trigger site scan/audit mutation
  const scanMutation = useMutation({
    mutationFn: (projectId: string) => triggerProjectScan(projectId, orgId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      // Refresh tasks + linked landing pages after hybrid scan (scores + ON_PAGE tasks)
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
    },
  });

  // 4. Delete project profile mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    favoriteMutation,
    agentToggleMutation,
    scanMutation,
    deleteMutation,
  };
}
