import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EcomEntityType } from "@liora/api-types";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { ecomApi } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";
import {
  mapApiTagToOrderFe,
  mapApiTagToProductFe,
} from "@/lib/mappers/ecom.mapper";

export function useOrderTags() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.tags("order"),
    queryFn: async () => {
      const data = await ecomApi.listTags("order");
      return { ...data, items: data.items.map(mapApiTagToOrderFe) };
    },
    enabled,
  });
}

export function useProductTags() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.tags("product"),
    queryFn: async () => {
      const data = await ecomApi.listTags("product");
      return { ...data, items: data.items.map(mapApiTagToProductFe) };
    },
    enabled,
  });
}

export function useCreateTag(entity: EcomEntityType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; color?: string }) =>
      ecomApi.createTag({ entity, ...payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.tags(entity),
      });
    },
  });
}

export function useDeleteTag(entity: EcomEntityType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ecomApi.deleteTag(entity, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.tags(entity),
      });
    },
  });
}