import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSeoTasks, updateSeoTask, approveSeoTask, rejectSeoTask, deploySeoTask } from "../api/seo-tasks.api";
import { SeoTask } from "../types";

export function useSeoTasksQuery(orgId: string, seoProjectId: string | null) {
  return useQuery<SeoTask[]>({
    queryKey: ["ai-seo", "tasks", orgId, seoProjectId],
    queryFn: () => fetchSeoTasks(orgId, seoProjectId!),
    enabled: !!orgId && !!seoProjectId,
  });
}

export function useUpdateSeoTaskMutation(orgId: string, seoProjectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'todo' | 'in_progress' | 'completed' }) =>
      updateSeoTask(orgId, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "tasks", orgId, seoProjectId] });
    },
  });
}

export function useApproveSeoTaskMutation(orgId: string, seoProjectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveSeoTask(orgId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "tasks", orgId, seoProjectId] });
    },
  });
}

export function useRejectSeoTaskMutation(orgId: string, seoProjectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectSeoTask(orgId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "tasks", orgId, seoProjectId] });
    },
  });
}

export function useDeploySeoTaskMutation(orgId: string, seoProjectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deploySeoTask(orgId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "tasks", orgId, seoProjectId] });
    },
  });
}
