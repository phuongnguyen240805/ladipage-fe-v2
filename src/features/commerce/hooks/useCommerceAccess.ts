"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import { usePlatformAuth } from "@/features/auth/hooks/usePlatformAuth";
import type {
  CommerceMockRole,
  CommercePermission,
} from "@/features/commerce/types";
import {
  canBindPage,
  canManageStore,
  canReadOrders,
  canReadProduct,
  canWriteProduct,
  isCommerceMonetizeEnabled,
  permissionsForRole,
} from "@/features/commerce/utils/commerce-permissions";
import { isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

function subscribe(onStoreChange: () => void) {
  return commerceMockStore.subscribe(onStoreChange);
}

function getSnapshot() {
  return commerceMockStore.getRole();
}

export function useCommerceAccess() {
  const { permissions: platformPermissions } = usePlatformAuth();
  const useApi = isCommerceApiEnabled();
  const role = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "owner" as CommerceMockRole,
  );

  const permissions = useMemo(() => {
    if (!useApi) return permissionsForRole(role);
    return platformPermissions.filter(
      (permission): permission is CommercePermission =>
        permission.startsWith("commerce:"),
    );
  }, [platformPermissions, role, useApi]);

  const setRole = useCallback((next: CommerceMockRole) => {
    commerceMockStore.setRole(next);
  }, []);

  return {
    role,
    useApi,
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
