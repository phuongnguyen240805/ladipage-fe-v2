"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import { useCommerceProducts } from "@/features/commerce/hooks/useCommerceProducts";
import { commerceApi, isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

const subscribe = (cb: () => void) => commerceMockStore.subscribe(cb);
const getSnapshot = () => commerceMockStore.listInventory();

export function useCommerceInventory() {
  const mockInventory = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { products, refreshApi } = useCommerceProducts();
  const useApi = isCommerceApiEnabled();
  const inventory = useMemo(
    () => useApi
      ? products.map((product) => ({
          productId: product.id,
          productTitle: product.title,
          sku: product.sku,
          price: product.price,
          currencyCode: product.currencyCode,
          quantity: product.stock,
          locationName: "Medusa",
        }))
      : mockInventory,
    [mockInventory, products, useApi],
  );

  const updateStock = useCallback(async (
    productId: string,
    quantity: number,
  ) => {
    if (useApi) {
      await commerceApi.updateProductStock(productId, quantity);
      await refreshApi();
      return;
    }
    commerceMockStore.updateStock(productId, quantity);
  }, [refreshApi, useApi]);

  return { inventory, updateStock, useApi };
}
