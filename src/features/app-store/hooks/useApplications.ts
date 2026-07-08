"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getRegistryByFeId } from "@/config/app-registry";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import {
  applicationApi,
  type UpdateApplicationPayload,
} from "@/lib/endpoints/application.api";
import { queryKeys } from "@/lib/query-keys";
import type { AppItem } from "../types";
import {
  buildFallbackApplications,
  mergeApplicationsWithRegistry,
} from "../utils/merge-applications";

export function useApplications() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.applications.list,
    queryFn: async () => {
      try {
        const records = await applicationApi.list();
        return mergeApplicationsWithRegistry(records);
      } catch (error) {
        console.warn(
          "[useApplications] API unavailable, using registry fallback:",
          error instanceof Error ? error.message : error,
        );
        return buildFallbackApplications();
      }
    },
    enabled,
    placeholderData: buildFallbackApplications(),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      code,
      payload,
    }: {
      code: string;
      payload: UpdateApplicationPayload;
    }) => applicationApi.update(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.list });
    },
  });
}

export function useInstalledApplicationIds(apps: AppItem[] | undefined) {
  return useMemo(() => {
    const installed = new Set<string>();
    for (const app of apps ?? []) {
      if (app.status === "INSTALLED") {
        installed.add(app.id);
      }
    }
    return installed;
  }, [apps]);
}

export function resolveApplicationCode(feId: string): string | undefined {
  return getRegistryByFeId(feId)?.code;
}