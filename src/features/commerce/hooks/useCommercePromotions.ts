"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useCommerceAdminResource } from "./useCommerceAdminResource";
import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type { CommercePromotion } from "@/features/commerce/types";
import { isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

const subscribe = (cb: () => void) => commerceMockStore.subscribe(cb);
const getSnapshot = () => commerceMockStore.listPromotions();

function normalize(value: Record<string, unknown>): CommercePromotion {
  const metadata = (value.metadata ?? {}) as Record<string, unknown>;
  const application = (value.application_method ?? {}) as Record<string, unknown>;
  return {
    id: String(value.id),
    code: String(value.code ?? ""),
    type: String(
      value.type ?? application.type ?? metadata.type ?? "percentage",
    ) as CommercePromotion["type"],
    value: Number(value.value ?? application.value ?? metadata.value ?? 0),
    minOrder: Number(value.minOrder ?? metadata.min_order ?? 0),
    currencyCode: String(value.currencyCode ?? metadata.currency_code ?? "vnd"),
    startAt: String(value.startAt ?? value.starts_at ?? new Date().toISOString()),
    endAt: String(value.endAt ?? value.ends_at ?? new Date().toISOString()),
    status: String(value.status ?? metadata.status ?? "active") as CommercePromotion["status"],
  };
}

export function useCommercePromotions() {
  const mock = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const api = useCommerceAdminResource("promotions", normalize);
  const useApi = isCommerceApiEnabled();

  const savePromotion = useCallback(async (
    id: string | undefined,
    input: Omit<CommercePromotion, "id" | "currencyCode">,
  ) => {
    if (!useApi) {
      return id
        ? commerceMockStore.updatePromotion(id, input)
        : commerceMockStore.createPromotion(input);
    }
    const body = {
      code: input.code,
      type: "standard",
      application_method: {
        type: input.type,
        target_type: "order",
        value: input.value,
        currency_code: "vnd",
      },
      starts_at: input.startAt,
      ends_at: input.endAt,
      metadata: {
        type: input.type,
        value: input.value,
        min_order: input.minOrder,
        currency_code: "vnd",
        status: input.status,
      },
    };
    return id ? api.update(id, body) : api.create(body);
  }, [api, useApi]);

  const deletePromotion = useCallback(async (id: string) => {
    if (useApi) return api.remove(id);
    commerceMockStore.deletePromotion(id);
  }, [api, useApi]);

  return {
    promotions: useApi && api.ready ? api.items : mock,
    savePromotion,
    deletePromotion,
    useApi,
  };
}
