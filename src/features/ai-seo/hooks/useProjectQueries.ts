import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject, updateProject, deleteProject } from "../api/projects.api";
import type { AiSeoProjectListItem, Project } from "../types";

/** Workspace project list may be legacy Project rows or Nest AiSeo project cards. */
export type ProjectListItem = Project | AiSeoProjectListItem;

export function useProjectsQuery(orgId: string) {
  return useQuery<ProjectListItem[]>({
    queryKey: ["ai-seo", "projects", orgId],
    queryFn: () => fetchProjects(orgId),
    enabled: !!orgId,
  });
}

export function useCreateProjectMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createProject(orgId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "projects", orgId] });
    },
  });
}

export function useUpdateProjectMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateProject(orgId, id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "projects", orgId] });
    },
  });
}

export function useDeleteProjectMutation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(orgId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "projects", orgId] });
    },
  });
}
