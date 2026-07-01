"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { crmApi } from "@/lib/endpoints/crm.api";
import { queryKeys } from "@/lib/query-keys";
import {
  mapApiCustomFieldToFe,
  mapCustomerFieldTypeToBe,
} from "@/lib/mappers/crm.mapper";

const personFieldParams = { targetType: "person" as const };

export function useCustomerCustomFields() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.customFields(personFieldParams),
    queryFn: async () => {
      const data = await crmApi.listCustomFields(personFieldParams);
      return { ...data, items: data.items.map(mapApiCustomFieldToFe) };
    },
    enabled,
  });
}

export function useCreateCustomerCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      displayName: string;
      fieldName: string;
      dataType: string;
      description?: string;
    }) =>
      crmApi.createCustomField({
        displayName: payload.displayName,
        fieldName: payload.fieldName,
        dataType: mapCustomerFieldTypeToBe(payload.dataType),
        description: payload.description,
        targetType: "person",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["crm", "custom-fields"],
      });
    },
  });
}

export function useDeleteCustomerCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteCustomField(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["crm", "custom-fields"],
      });
    },
  });
}