"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { ecomApi, type PagerParams } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";
import {
  mapApiProductToFe,
  mapFeProductStatusToBe,
  type FeProductStatus,
} from "@/lib/mappers/ecom.mapper";

export function useProducts(params?: PagerParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.products(params),
    queryFn: async () => {
      const data = await ecomApi.listProducts(params);
      return { ...data, items: data.items.map(mapApiProductToFe) };
    },
    enabled,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      sku: string;
      type: string;
      typeName: string;
      description?: string;
      categoryId?: number;
      tagIds?: number[];
    }) =>
      ecomApi.createProduct({
        name: payload.name,
        sku: payload.sku,
        type: payload.type,
        typeName: payload.typeName,
        description: payload.description,
        categoryId: payload.categoryId,
        tagIds: payload.tagIds,
        price: 0,
        stock: 0,
        status: "ACTIVE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ecom", "products"] });
    },
  });
}

export function useDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await ecomApi.deleteProduct(id);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ecom", "products"] });
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: FeProductStatus;
    }) =>
      ecomApi.updateProduct(id, {
        status: mapFeProductStatusToBe(status),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ecom", "products"] });
    },
  });
}