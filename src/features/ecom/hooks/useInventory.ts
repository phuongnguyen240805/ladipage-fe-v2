"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ecomApi } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      stock,
      delta,
    }: {
      productId: number;
      stock?: number;
      delta?: number;
    }) => ecomApi.updateInventory(productId, { stock, delta }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ecom", "products"] });
    },
  });
}