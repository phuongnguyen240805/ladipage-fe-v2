"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchProjectTraffic,
  fetchTrafficHealth,
  provisionProjectTraffic,
} from "../api/traffic.api";
import { isAiSeoNestApi } from "../utils/ai-seo-api-mode";

export function useProjectTrafficQuery(
  projectId: string | undefined,
  range: "7d" | "30d" = "7d"
) {
  const nest = isAiSeoNestApi();
  return useQuery({
    queryKey: ["ai-seo", "traffic", projectId, range, nest],
    queryFn: () => fetchProjectTraffic(projectId!, range),
    enabled: Boolean(projectId),
    staleTime: 60_000,
    retry: nest ? 1 : 0,
  });
}

export function useTrafficHealthQuery() {
  const nest = isAiSeoNestApi();
  return useQuery({
    queryKey: ["ai-seo", "traffic-health", nest],
    queryFn: () => fetchTrafficHealth(),
    enabled: nest,
    staleTime: 30_000,
    retry: 0,
  });
}

export function useProvisionTrafficMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => provisionProjectTraffic(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-seo", "traffic", projectId],
      });
    },
  });
}
