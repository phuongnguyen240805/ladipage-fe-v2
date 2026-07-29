"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  commerceMockStore,
  mockMedusaOrganization,
} from "@/features/commerce/mock/commerce-mock-store";
import type { CommerceStoreLink } from "@/features/commerce/types";
import { commerceApi, isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

function subscribe(cb: () => void) {
  return commerceMockStore.subscribe(cb);
}

function getStoreLinkSnapshot() {
  return commerceMockStore.getStoreLink();
}

export function useCommerceStoreLink() {
  const mockStoreLink = useSyncExternalStore(
    subscribe,
    getStoreLinkSnapshot,
    getStoreLinkSnapshot,
  );
  const useApi = isCommerceApiEnabled();
  const [apiStoreLink, setApiStoreLink] = useState<CommerceStoreLink | null>(
    null,
  );

  useEffect(() => {
    if (!useApi) return;
    void commerceApi.getStore().then(
      (value) => setApiStoreLink(value as CommerceStoreLink),
      (error) => {
        console.warn("[commerce] store API unavailable", error);
        setApiStoreLink(null);
      },
    );
  }, [useApi]);

  const updateStore = useCallback(async (patch: Partial<CommerceStoreLink>) => {
    if (useApi) {
      const value = await commerceApi.updateStore(patch);
      setApiStoreLink(value as CommerceStoreLink);
      return;
    }
    commerceMockStore.updateStoreLink(patch);
  }, [useApi]);

  return {
    storeLink: apiStoreLink ?? mockStoreLink,
    organization: mockMedusaOrganization,
    updateStore,
    useApi,
  };
}
