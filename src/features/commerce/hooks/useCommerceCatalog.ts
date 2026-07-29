"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useCommerceAdminResource } from "./useCommerceAdminResource";
import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type {
  CommerceCategory,
  CommerceProductTag,
} from "@/features/commerce/types";
import { isCommerceApiEnabled } from "@/lib/endpoints/commerce.api";

function subscribe(cb: () => void) {
  return commerceMockStore.subscribe(cb);
}
const getCategories = () => commerceMockStore.listCategories();
const getTags = () => commerceMockStore.listProductTags();

function category(value: Record<string, unknown>): CommerceCategory {
  const metadata = (value.metadata ?? {}) as Record<string, unknown>;
  const parent = value.parent_category as { id?: string } | undefined;
  return {
    id: String(value.id),
    name: String(value.name ?? ""),
    parentId: String(value.parent_id ?? parent?.id ?? "") || null,
    thumbnailUrl:
      String(value.thumbnailUrl ?? metadata.thumbnail_url ?? "") || null,
    productCount: Number(value.productCount ?? value.products_count ?? 0),
    visible: Boolean(value.visible ?? !value.is_internal),
  };
}

function tag(value: Record<string, unknown>): CommerceProductTag {
  const metadata = (value.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(value.id),
    name: String(value.name ?? value.value ?? ""),
    color: String(value.color ?? metadata.ladipage_color ?? "#8b5cf6"),
    productCount: Number(value.productCount ?? value.products_count ?? 0),
  };
}

export function useCommerceCatalog() {
  const mockCategories = useSyncExternalStore(
    subscribe,
    getCategories,
    getCategories,
  );
  const mockTags = useSyncExternalStore(subscribe, getTags, getTags);
  const categoryApi = useCommerceAdminResource("categories", category);
  const tagApi = useCommerceAdminResource("product-tags", tag);
  const useApi = isCommerceApiEnabled();

  const saveCategory = useCallback(async (
    id: string | undefined,
    input: Omit<CommerceCategory, "id" | "productCount">,
  ) => {
    if (!useApi) {
      return id
        ? commerceMockStore.updateCategory(id, input)
        : commerceMockStore.createCategory(input);
    }
    const body = {
      name: input.name,
      parent_category_id: input.parentId,
      is_internal: !input.visible,
      metadata: { thumbnail_url: input.thumbnailUrl },
    };
    return id ? categoryApi.update(id, body) : categoryApi.create(body);
  }, [categoryApi, useApi]);

  const deleteCategory = useCallback(async (id: string) => {
    if (useApi) return categoryApi.remove(id);
    commerceMockStore.deleteCategory(id);
  }, [categoryApi, useApi]);

  const saveTag = useCallback(async (
    id: string | undefined,
    input: Pick<CommerceProductTag, "name" | "color">,
  ) => {
    if (!useApi) {
      return id
        ? commerceMockStore.updateProductTag(id, input)
        : commerceMockStore.createProductTag(input);
    }
    const body = {
      value: input.name,
      metadata: { ladipage_color: input.color },
    };
    return id ? tagApi.update(id, body) : tagApi.create(body);
  }, [tagApi, useApi]);

  const deleteTag = useCallback(async (id: string) => {
    if (useApi) return tagApi.remove(id);
    commerceMockStore.deleteProductTag(id);
  }, [tagApi, useApi]);

  return {
    categories: useApi && categoryApi.ready
      ? categoryApi.items
      : mockCategories,
    tags: useApi && tagApi.ready ? tagApi.items : mockTags,
    saveCategory,
    deleteCategory,
    saveTag,
    deleteTag,
    useApi,
  };
}
