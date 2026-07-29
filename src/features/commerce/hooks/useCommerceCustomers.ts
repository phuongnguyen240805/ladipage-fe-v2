"use client";

import { useSyncExternalStore } from "react";
import { useCommerceAdminResource } from "./useCommerceAdminResource";
import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type { CommerceCustomer } from "@/features/commerce/types";
import { isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

const subscribe = (cb: () => void) => commerceMockStore.subscribe(cb);
const getSnapshot = () => commerceMockStore.listCustomers();

function normalize(value: Record<string, unknown>): CommerceCustomer {
  const metadata = (value.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(value.id),
    name: String(
      value.name
        ?? `${String(value.first_name ?? "")} ${String(value.last_name ?? "")}`.trim(),
    ),
    email: String(value.email ?? ""),
    phone: String(value.phone ?? ""),
    ordersCount: Number(value.ordersCount ?? metadata.orders_count ?? 0),
    totalSpent: Number(value.totalSpent ?? metadata.total_spent ?? 0),
    currencyCode: String(value.currencyCode ?? metadata.currency_code ?? "vnd"),
    createdAt: String(value.createdAt ?? value.created_at ?? new Date().toISOString()),
  };
}

export function useCommerceCustomers() {
  const mock = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const api = useCommerceAdminResource("customers", normalize);
  const useApi = isCommerceApiEnabled();
  return {
    customers: useApi && api.ready ? api.items : mock,
    createCustomer: api.create,
    updateCustomer: api.update,
    deleteCustomer: api.remove,
    useApi,
  };
}
