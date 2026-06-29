import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject, updateProject, deleteProject } from "../api/projects.api";
import { Project } from "../types";

export function useProjectsQuery(orgId: string) {
  return useQuery<Project[]>({
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
