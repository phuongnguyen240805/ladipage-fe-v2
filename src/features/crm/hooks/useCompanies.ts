"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { crmApi, type PagerParams } from "@/lib/endpoints/crm.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiCompanyToFe } from "@/lib/mappers/crm.mapper";

export function useCompanies(params?: PagerParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.companies(params),
    queryFn: async () => {
      const data = await crmApi.listCompanies(params);
      return { ...data, items: data.items.map(mapApiCompanyToFe) };
    },
    enabled,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => crmApi.createCompany(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "companies"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteCompany(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "companies"] });
    },
  });
}