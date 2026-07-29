/**
 * Commerce API client → Nest /commerce/*
 * Used when NEXT_PUBLIC_COMMERCE_USE_API=true; otherwise FE keeps mock store.
 */
import { apiDelete, apiGet, apiPatch, apiPost } from "../api-client";

export type CommerceProductApi = {
  id: string;
  title: string;
  handle: string;
  sku: string;
  status: "published" | "draft" | "archived";
  price: number;
  compareAtPrice: number;
  currencyCode: string;
  stock: number;
  thumbnailUrl: string | null;
  images: string[];
  shortDescription: string;
  description: string;
  highlights: string[];
  brand: string;
  badge: string;
  unit: string;
  shippingNote: string;
  salesChannelId: string;
  createdAt: string;
  updatedAt: string;
};

export type CommerceStoreLinkApi = {
  ladipageOrganizationId: string;
  salesChannelId: string;
  salesChannelName: string;
  regionId: string;
  currencyCode: string;
  status: string;
  healthMessage?: string;
  provisionedAt: string | null;
};

export type CommerceHealthApi = {
  enabled: boolean;
  mockMode: boolean;
  monetize: boolean;
  medusaBaseUrl: string;
  medusaReachable: boolean;
  message: string;
};

export type CommerceOrderApi = {
  id: string;
  displayId: string;
  email: string;
  customerName: string;
  total: number;
  currencyCode: string;
  status: string;
  landingPageId: string | null;
  landingPageName: string | null;
  itemsSummary: string;
  createdAt: string;
};

const PREFIX = "/commerce";

export function isCommerceApiEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_COMMERCE_USE_API;
  return value !== "false" && value !== "0";
}

export const commerceApi = {
  health() {
    return apiGet<CommerceHealthApi>(`${PREFIX}/health`);
  },

  getStore() {
    return apiGet<CommerceStoreLinkApi>(`${PREFIX}/store`);
  },

  provisionStore() {
    return apiPost<CommerceStoreLinkApi>(`${PREFIX}/store/provision`, {});
  },

  updateStore(body: Partial<Pick<
    CommerceStoreLinkApi,
    "salesChannelName" | "regionId" | "currencyCode" | "healthMessage"
  >>) {
    return apiPatch<CommerceStoreLinkApi>(`${PREFIX}/store`, body);
  },

  listProducts() {
    return apiGet<{ items: CommerceProductApi[]; total: number }>(
      `${PREFIX}/products`,
    );
  },

  getProduct(id: string) {
    return apiGet<CommerceProductApi>(
      `${PREFIX}/products/${encodeURIComponent(id)}`,
    );
  },

  createProduct(body: {
    title: string;
    sku?: string;
    price: number;
    compareAtPrice?: number;
    stock?: number;
    shortDescription?: string;
    description?: string;
    images?: string[];
    highlights?: string[];
    brand?: string;
    badge?: string;
    unit?: string;
    shippingNote?: string;
    status?: string;
  }) {
    return apiPost<CommerceProductApi>(`${PREFIX}/products`, body);
  },

  updateProductStatus(
    id: string,
    status: "published" | "draft" | "archived",
  ) {
    return apiPatch<CommerceProductApi>(
      `${PREFIX}/products/${encodeURIComponent(id)}/status`,
      { status },
    );
  },

  updateProductStock(id: string, stock: number) {
    return apiPatch<CommerceProductApi>(
      `${PREFIX}/products/${encodeURIComponent(id)}/stock`,
      { stock },
    );
  },

  deleteProduct(id: string) {
    return apiDelete<{ id: string; deleted: boolean }>(
      `${PREFIX}/products/${encodeURIComponent(id)}`,
    );
  },

  listOrders() {
    return apiGet<{ items: CommerceOrderApi[]; total: number }>(
      `${PREFIX}/orders`,
    );
  },

  listAdminResource<T>(kind: CommerceAdminResourceKind) {
    return apiGet<T[]>(`${PREFIX}/admin/${kind}`);
  },

  createAdminResource<T>(
    kind: CommerceAdminResourceKind,
    body: Record<string, unknown>,
  ) {
    return apiPost<T>(`${PREFIX}/admin/${kind}`, body);
  },

  updateAdminResource<T>(
    kind: CommerceAdminResourceKind,
    id: string,
    body: Record<string, unknown>,
  ) {
    return apiPatch<T>(
      `${PREFIX}/admin/${kind}/${encodeURIComponent(id)}`,
      body,
    );
  },

  deleteAdminResource(kind: CommerceAdminResourceKind, id: string) {
    return apiDelete<{ id: string; deleted: boolean }>(
      `${PREFIX}/admin/${kind}/${encodeURIComponent(id)}`,
    );
  },

  storefrontSession(body?: { organizationId?: string; pageId?: string }) {
    return apiPost<{
      mockMode: boolean;
      medusaBaseUrl: string;
      publishableKey: string;
      salesChannelId: string;
      regionId: string;
      currencyCode: string;
      pageId?: string;
    }>(`${PREFIX}/storefront/session`, body ?? {});
  },
};

export type CommerceAdminResourceKind =
  | "categories"
  | "product-tags"
  | "customers"
  | "promotions";
