"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { crmApi, type PagerParams } from "@/lib/endpoints/crm.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiSegmentToFe } from "@/lib/mappers/crm.mapper";

export function useSegments(params?: PagerParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.segments(params),
    queryFn: async () => {
      const data = await crmApi.listSegments(params);
      return { ...data, items: data.items.map(mapApiSegmentToFe) };
    },
    enabled,
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      crmApi.createSegment({ name: payload.name, isDefault: false }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "segments"] });
    },
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteSegment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "segments"] });
    },
  });
}