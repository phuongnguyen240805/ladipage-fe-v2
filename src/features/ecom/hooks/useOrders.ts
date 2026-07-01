"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderItem } from "@liora/api-types";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import {
  ecomApi,
  type CreateOrderPayload,
  type OrderListParams,
} from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiOrdersToFe } from "@/lib/mappers/ecom.mapper";
import type { OrderItem as FeOrderItem } from "@/components/sales/dung-chung/types";

export function useOrders(params?: OrderListParams) {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.ecom.orders(params),
    queryFn: async () => {
      const data = await ecomApi.listOrders(params);
      return {
        ...data,
        items: mapApiOrdersToFe(data.items),
      };
    },
    enabled,
  });
}

export function findOrderIdByCode(
  orders: FeOrderItem[],
  code: string
): number | null {
  const match = orders.find((o) => o.id === code);
  return match?.orderId ?? null;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ecomApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ecom", "orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.onboarding });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number;
      status: OrderItem["status"];
    }) => ecomApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ecom", "orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.onboarding });
    },
  });
}
