import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EcomEntityType } from "@liora/api-types";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { ecomApi } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";
import {
  mapApiCustomFieldToOrderFe,
  mapApiCustomFieldToProductFe,
  mapOrderFieldTypeToBe,
  mapProductFieldTypeToBe,
} from "@/lib/mappers/ecom.mapper";

export function useOrderCustomFields() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.customFields("order"),
    queryFn: async () => {
      const data = await ecomApi.listCustomFields("order");
      return { ...data, items: data.items.map(mapApiCustomFieldToOrderFe) };
    },
    enabled,
  });
}

export function useProductCustomFields() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.customFields("product"),
    queryFn: async () => {
      const data = await ecomApi.listCustomFields("product");
      return { ...data, items: data.items.map(mapApiCustomFieldToProductFe) };
    },
    enabled,
  });
}

export function useCreateCustomField(entity: EcomEntityType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      displayName: string;
      fieldName: string;
      dataType: string;
    }) =>
      ecomApi.createCustomField({
        entity,
        displayName: payload.displayName,
        fieldName: payload.fieldName,
        dataType:
          entity === "order"
            ? mapOrderFieldTypeToBe(payload.dataType)
            : mapProductFieldTypeToBe(payload.dataType),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.customFields(entity),
      });
    },
  });
}

export function useDeleteCustomField(entity: EcomEntityType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ecomApi.deleteCustomField(entity, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.customFields(entity),
      });
    },
  });
}