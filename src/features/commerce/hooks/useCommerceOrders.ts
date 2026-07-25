"use client";

import { useSyncExternalStore } from "react";

import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";

function subscribe(cb: () => void) {
  return commerceMockStore.subscribe(cb);
}

function getSnapshot() {
  return commerceMockStore.listOrders();
}

export function useCommerceOrders() {
  const orders = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return { orders };
}
