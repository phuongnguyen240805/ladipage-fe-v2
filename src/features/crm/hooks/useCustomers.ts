"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import {
  crmApi,
  type CreateCustomerPayload,
  type CustomerListParams,
} from "@/lib/endpoints/crm.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiCustomersToFe } from "@/lib/mappers/crm.mapper";

export function useCustomers(params?: CustomerListParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.customers(params),
    queryFn: async () => {
      const data = await crmApi.listCustomers(params);
      return { ...data, items: mapApiCustomersToFe(data.items) };
    },
    enabled,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) =>
      crmApi.createCustomer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "customers"] });
      void queryClient.invalidateQueries({ queryKey: ["crm", "tags"] });
      void queryClient.invalidateQueries({ queryKey: ["crm", "segments"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    },
  });
}

export function useDeleteCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await crmApi.deleteCustomer(id);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "customers"] });
      void queryClient.invalidateQueries({ queryKey: ["crm", "tags"] });
      void queryClient.invalidateQueries({ queryKey: ["crm", "segments"] });
    },
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: string[];
      status: "ACTIVE" | "BLOCKED";
    }) => {
      for (const id of ids) {
        await crmApi.updateCustomer(id, { status });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm", "customers"] });
    },
  });
}