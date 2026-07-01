"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import {
  ecomApi,
  type DeliveryNoteItem,
  type PagerParams,
} from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";

export function useDeliveryNotes(params?: PagerParams & { orderId?: number }) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.deliveryNotes(params),
    queryFn: () => ecomApi.listDeliveryNotes(params),
    enabled,
  });
}

export function useCreateDeliveryNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      orderId: number;
      content?: string;
      status?: string;
    }) => ecomApi.createDeliveryNote(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["ecom", "delivery-notes"],
      });
    },
  });
}

export function useDeleteDeliveryNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ecomApi.deleteDeliveryNote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["ecom", "delivery-notes"],
      });
    },
  });
}

export type { DeliveryNoteItem };