"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { crmApi, type PagerParams } from "@/lib/endpoints/crm.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiTagToFe } from "@/lib/mappers/crm.mapper";

export function useCustomerTags(params?: PagerParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.tags(params),
    queryFn: async () => {
      const data = await crmApi.listTags(params);
      return { ...data, items: data.items.map(mapApiTagToFe) };
    },
    enabled,
  });
}

export function useCreateCustomerTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => crmApi.createTag(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "tags"] });
    },
  });
}

export function useDeleteCustomerTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteTag(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "tags"] });
    },
  });
}