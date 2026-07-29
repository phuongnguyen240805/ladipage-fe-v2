"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type { CommerceOrder } from "@/features/commerce/types";
import { commerceApi, isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

function subscribe(cb: () => void) {
  return commerceMockStore.subscribe(cb);
}

function getSnapshot() {
  return commerceMockStore.listOrders();
}

export function useCommerceOrders() {
  const mockOrders = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const useApi = isCommerceApiEnabled();
  const [apiOrders, setApiOrders] = useState<CommerceOrder[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!useApi) return;
    void commerceApi.listOrders().then(
      (result) => {
        setApiOrders(result.items as CommerceOrder[]);
        setReady(true);
      },
      (error) => {
        console.warn("[commerce] orders API unavailable", error);
        setReady(false);
      },
    );
  }, [useApi]);

  return { orders: useApi && ready ? apiOrders : mockOrders, useApi };
}
