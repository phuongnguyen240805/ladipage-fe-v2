"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UpdateIntegrationsSettingsPayload,
  UpdateWorkspaceSettingsPayload,
} from "@liora/api-types";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { settingsApi } from "@/lib/endpoints/settings.api";
import { queryKeys } from "@/lib/query-keys";

export function useWorkspaceSettings() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.settings.workspace,
    queryFn: settingsApi.getWorkspace,
    enabled,
  });
}

export function useIntegrationsSettings() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.settings.integrations,
    queryFn: settingsApi.getIntegrations,
    enabled,
  });
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspaceSettingsPayload) =>
      settingsApi.updateWorkspace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.workspace });
    },
  });
}

export function useUpdateIntegrationsSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIntegrationsSettingsPayload) =>
      settingsApi.updateIntegrations(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.integrations,
      });
    },
  });
}
