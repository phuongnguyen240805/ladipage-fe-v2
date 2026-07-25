"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type { CommerceMockRole } from "@/features/commerce/types";
import {
  canBindPage,
  canManageStore,
  canReadOrders,
  canReadProduct,
  canWriteProduct,
  isCommerceMonetizeEnabled,
} from "@/features/commerce/utils/commerce-permissions";

function subscribe(onStoreChange: () => void) {
  return commerceMockStore.subscribe(onStoreChange);
}

function getSnapshot() {
  return commerceMockStore.getRole();
}

export function useCommerceAccess() {
  const role = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "owner" as CommerceMockRole,
  );

  const permissions = useMemo(
    () => commerceMockStore.getPermissions(),
    [role],
  );

  const setRole = useCallback((next: CommerceMockRole) => {
    commerceMockStore.setRole(next);
  }, []);

  return {
    role,
    permissions,
    setRole,
    monetizeEnabled: isCommerceMonetizeEnabled(),
    canReadProduct: canReadProduct(permissions),
    canWriteProduct: canWriteProduct(permissions),
    canBindPage: canBindPage(permissions),
    canReadOrders: canReadOrders(permissions),
    canManageStore: canManageStore(permissions),
  };
}
