"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type { CommerceProduct } from "@/features/commerce/types";
import { isApiBusinessError } from "@/features/auth/utils/auth-error-messages";
import {
  commerceApi,
  isCommerceApiEnabled,
} from "@/lib/endpoints/commerce.api";

function subscribe(cb: () => void) {
  return commerceMockStore.subscribe(cb);
}

function getSnapshot() {
  return commerceMockStore.listProducts();
}

const COMMERCE_PERMISSION_DENIED = 1102;

function warnUnlessPermissionDenied(message: string, error: unknown) {
  if (!isApiBusinessError(error, COMMERCE_PERMISSION_DENIED)) {
    console.warn(message, error);
  }
}

export function useCommerceProducts() {
  const mockProducts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // The backend RBAC guard is authoritative. Do not pre-filter with the
  // hydrated permission list: it can be stale/empty and admins may be allowed
  // by role even when no explicit permission key is returned to the client.
  const useApi = isCommerceApiEnabled();
  const [apiProducts, setApiProducts] = useState<CommerceProduct[]>([]);
  const [apiReady, setApiReady] = useState(false);

  const refreshApi = useCallback(async () => {
    if (!useApi) return;
    try {
      const res = await commerceApi.listProducts();
      setApiProducts(res.items as CommerceProduct[]);
      setApiReady(true);
    } catch (err) {
      warnUnlessPermissionDenied(
        "[commerce] API list failed, falling back to mock",
        err,
      );
      setApiReady(false);
    }
  }, [useApi]);

  useEffect(() => {
    if (!useApi) return;
    void commerceApi.listProducts().then(
      (result) => {
        setApiProducts(result.items as CommerceProduct[]);
        setApiReady(true);
      },
      (error) => {
        warnUnlessPermissionDenied(
          "[commerce] API list failed, falling back to mock",
          error,
        );
        setApiReady(false);
      },
    );
  }, [useApi]);

  const products = useApi && apiReady ? apiProducts : mockProducts;

  const createProduct = useCallback(
    async (input: {
      title: string;
      sku?: string;
      price: number;
      compareAtPrice?: number;
      stock?: number;
      description?: string;
      shortDescription?: string;
      images?: string[];
      highlights?: string[];
      brand?: string;
      badge?: string;
      unit?: string;
      shippingNote?: string;
      status?: CommerceProduct["status"];
    }) => {
      if (useApi) {
        try {
          const created = await commerceApi.createProduct(input);
          await refreshApi();
          return created as CommerceProduct;
        } catch (err) {
          warnUnlessPermissionDenied(
            "[commerce] API create failed, using mock",
            err,
          );
        }
      }
      return commerceMockStore.createProduct(input);
    },
    [useApi, refreshApi],
  );

  const updateStatus = useCallback(
    async (id: string, status: CommerceProduct["status"]) => {
      if (useApi) {
        try {
          await commerceApi.updateProductStatus(id, status);
          await refreshApi();
          return;
        } catch (err) {
          warnUnlessPermissionDenied(
            "[commerce] API status failed, using mock",
            err,
          );
        }
      }
      commerceMockStore.updateProductStatus(id, status);
    },
    [useApi, refreshApi],
  );

  const deleteProduct = useCallback(async (id: string) => {
    if (useApi) {
      await commerceApi.deleteProduct(id);
      await refreshApi();
      return;
    }
    commerceMockStore.updateProductStatus(id, "archived");
  }, [refreshApi, useApi]);

  return {
    products,
    createProduct,
    updateStatus,
    deleteProduct,
    refreshApi,
    useApi,
  };
}
