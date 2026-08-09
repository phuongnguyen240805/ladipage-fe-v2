import type {
  EcomCategoryItem,
  EcomCustomFieldItem,
  EcomEntityType,
  EcomReviewItem,
  EcomTagItem,
  OrderItem,
  PaginatedData,
  ProductItem,
} from "@liora/api-types";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../api-client";
import { buildCreateOrderRequestBody } from "./create-order-body";

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface CreateOrderItemPayload {
  productName: string;
  quantity: number;
  unitPrice: number;
  productId?: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod?: string;
  shippingFee?: number;
  notes?: string;
  source?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  items: CreateOrderItemPayload[];
  tagIds?: number[];
}

export type ShippingProvider = "ghn" | "ghtk";

export interface ShippingIntegration {
  id?: number;
  provider: ShippingProvider;
  name: string;
  enabled: boolean;
  configured: boolean;
  connectedAt?: string | null;
  settings: Record<string, unknown>;
  credentials: { token: string; shopId?: string };
  capabilities?: {
    quote: boolean;
    createShipment: boolean;
    cancelShipment: boolean;
    tracking: boolean;
    provinceApi: boolean;
    districtApi: boolean;
    wardApi: boolean;
    services: boolean;
    webhook: boolean;
    label: boolean;
    pickup: boolean;
    instantDelivery: boolean;
  };
}

export interface ShippingAddressPayload {
  address: string;
  province: string;
  district: string;
  ward: string;
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
}

export interface ShippingQuotePayload {
  provider: ShippingProvider;
  address: ShippingAddressPayload;
  parcel?: { weight?: number; length?: number; width?: number; height?: number };
  serviceId?: number;
  serviceTypeId?: number;
  insuranceValue?: number;
}

export interface CreateShipmentPayload extends ShippingQuotePayload {
  idempotencyKey?: string;
  recipientName: string;
  recipientPhone: string;
  serviceName?: string;
  fee?: number;
  codAmount?: number;
  note?: string;
  requiredNote?: string;
}

export interface ShipmentItem {
  id: number;
  orderId: number;
  provider: ShippingProvider;
  trackingCode?: string | null;
  providerOrderId?: string | null;
  providerStatus?: string | null;
  serviceName?: string | null;
  status: string;
  fee: number;
  codAmount: number;
  address: string;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  lastTrackedAt?: string | null;
}

export interface ShipmentEventItem {
  id: number;
  shipmentId: number;
  provider: ShippingProvider;
  providerStatus?: string | null;
  status: string;
  description?: string | null;
  location?: string | null;
  occurredAt: string;
}

export interface CreatedOrderResponse {
  id: number;
  code: string;
  status: OrderItem["status"];
  total: number;
  shipment?: ShipmentItem | null;
}

export interface PagerParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface EcomStaffItem {
  id: string;
  name: string;
}

export const ecomApi = {
  listStaff(): Promise<{ items: EcomStaffItem[] }> {
    return apiGet<{ items: EcomStaffItem[] }>("/ecom/staff");
  },
  listOrders(params?: OrderListParams): Promise<PaginatedData<OrderItem>> {
    return apiGet<PaginatedData<OrderItem>>("/ecom/orders", { params });
  },

  createOrder(payload: CreateOrderPayload): Promise<CreatedOrderResponse> {
    return apiPost<CreatedOrderResponse>("/ecom/orders", buildCreateOrderRequestBody(payload));
  },

  listShippingIntegrations(): Promise<ShippingIntegration[]> {
    return apiGet<ShippingIntegration[]>("/ecom/shipping/integrations");
  },

  saveShippingIntegration(
    provider: ShippingProvider,
    payload: {
      enabled?: boolean;
      token?: string;
      shopId?: string;
      settings?: Record<string, unknown>;
    }
  ): Promise<ShippingIntegration> {
    return apiPut<ShippingIntegration>(`/ecom/shipping/integrations/${provider}`, payload);
  },

  testShippingIntegration(provider: ShippingProvider): Promise<{ success: boolean; message: string }> {
    return apiPost(`/ecom/shipping/integrations/${provider}/test`, {});
  },

  shippingProvinces(): Promise<{ provinces: Array<{ ProvinceID: number; ProvinceName: string }> }> {
    return apiGet("/ecom/shipping/locations/provinces", { params: { provider: "ghn" } });
  },

  shippingDistricts(provinceId: number): Promise<{ districts: Array<{ DistrictID: number; DistrictName: string }> }> {
    return apiGet("/ecom/shipping/locations/districts", { params: { provider: "ghn", provinceId } });
  },

  shippingWards(districtId: number): Promise<{ wards: Array<{ WardCode: string; WardName: string }> }> {
    return apiGet("/ecom/shipping/locations/wards", { params: { provider: "ghn", districtId } });
  },

  shippingServices(toDistrict: number): Promise<{ services: Array<{ service_id: number; service_type_id: number; short_name: string }> }> {
    return apiGet("/ecom/shipping/services", { params: { provider: "ghn", toDistrict } });
  },

  quoteShipping(payload: ShippingQuotePayload): Promise<{ provider: ShippingProvider; total: number; serviceFee: number; insuranceFee: number }> {
    return apiPost("/ecom/shipping/quote", payload);
  },

  createShipment(orderId: number, payload: CreateShipmentPayload): Promise<ShipmentItem> {
    return apiPost<ShipmentItem>(`/ecom/shipping/orders/${orderId}`, payload);
  },

  getShipment(orderId: number): Promise<ShipmentItem | null> {
    return apiGet<ShipmentItem | null>(`/ecom/shipping/orders/${orderId}`);
  },

  refreshShipment(orderId: number): Promise<ShipmentItem> {
    return apiPost<ShipmentItem>(`/ecom/shipping/orders/${orderId}/refresh`, {});
  },

  cancelShipment(orderId: number): Promise<ShipmentItem> {
    return apiPost<ShipmentItem>(`/ecom/shipping/orders/${orderId}/cancel`, {});
  },

  getShipmentEvents(orderId: number): Promise<ShipmentEventItem[]> {
    return apiGet<ShipmentEventItem[]>(`/ecom/shipping/orders/${orderId}/events`);
  },

  updateOrderStatus(
    orderId: number,
    status: OrderItem["status"]
  ): Promise<OrderItem> {
    return apiPatch<OrderItem>(`/ecom/orders/${orderId}/status`, { status });
  },

  listProducts(params?: PagerParams): Promise<PaginatedData<ProductItem>> {
    return apiGet<PaginatedData<ProductItem>>("/ecom/products", { params });
  },

  createProduct(payload: {
    name: string;
    sku: string;
    price?: number;
    stock?: number;
    status?: string;
    type?: string;
    typeName?: string;
    description?: string;
    categoryId?: number;
    imageUrl?: string;
    tagIds?: number[];
  }): Promise<ProductItem> {
    return apiPost<ProductItem>("/ecom/products", {
      price: payload.price ?? 0,
      stock: payload.stock ?? 0,
      status: payload.status ?? "ACTIVE",
      ...payload,
    });
  },

  updateProduct(
    id: number,
    payload: Partial<{
      name: string;
      sku: string;
      price: number;
      stock: number;
      status: string;
      type: string;
      typeName: string;
    }>
  ): Promise<ProductItem> {
    return apiPatch<ProductItem>(`/ecom/products/${id}`, payload);
  },

  deleteProduct(id: number): Promise<void> {
    return apiDelete(`/ecom/products/${id}`);
  },

  listTags(
    entity: EcomEntityType,
    params?: PagerParams
  ): Promise<PaginatedData<EcomTagItem>> {
    return apiGet<PaginatedData<EcomTagItem>>("/ecom/tags", {
      params: { ...params, entity },
    });
  },

  createTag(payload: {
    entity: EcomEntityType;
    name: string;
    color?: string;
  }): Promise<EcomTagItem> {
    return apiPost<EcomTagItem>("/ecom/tags", payload);
  },

  deleteTag(entity: EcomEntityType, id: number): Promise<void> {
    return apiDelete(`/ecom/tags/${id}`, { params: { entity } });
  },

  listCustomFields(
    entity: EcomEntityType,
    params?: PagerParams
  ): Promise<PaginatedData<EcomCustomFieldItem>> {
    return apiGet<PaginatedData<EcomCustomFieldItem>>("/ecom/custom-fields", {
      params: { ...params, entity },
    });
  },

  createCustomField(payload: {
    entity: EcomEntityType;
    fieldName: string;
    displayName: string;
    dataType?: string;
  }): Promise<EcomCustomFieldItem> {
    return apiPost<EcomCustomFieldItem>("/ecom/custom-fields", payload);
  },

  deleteCustomField(entity: EcomEntityType, id: number): Promise<void> {
    return apiDelete(`/ecom/custom-fields/${id}`, { params: { entity } });
  },

  listCategories(params?: PagerParams): Promise<PaginatedData<EcomCategoryItem>> {
    return apiGet<PaginatedData<EcomCategoryItem>>("/ecom/categories", { params });
  },

  createCategory(payload: {
    name: string;
    parentId?: number | null;
    imageUrl?: string;
    visible?: boolean;
  }): Promise<EcomCategoryItem> {
    return apiPost<EcomCategoryItem>("/ecom/categories", payload);
  },

  updateCategory(
    id: number,
    payload: Partial<{
      name: string;
      parentId: number | null;
      imageUrl: string;
      visible: boolean;
    }>
  ): Promise<EcomCategoryItem> {
    return apiPatch<EcomCategoryItem>(`/ecom/categories/${id}`, payload);
  },

  deleteCategory(id: number): Promise<void> {
    return apiDelete(`/ecom/categories/${id}`);
  },

  listReviews(params?: PagerParams): Promise<PaginatedData<EcomReviewItem>> {
    return apiGet<PaginatedData<EcomReviewItem>>("/ecom/reviews", { params });
  },

  createReview(payload: {
    productId: number;
    rating: number;
    content?: string;
    reviewerName?: string;
    avatarUrl?: string;
    imageUrls?: string[];
    productNames?: string[];
  }): Promise<EcomReviewItem> {
    return apiPost<EcomReviewItem>("/ecom/reviews", payload);
  },

  deleteReview(id: number): Promise<void> {
    return apiDelete(`/ecom/reviews/${id}`);
  },

  listDeliveryNotes(
    params?: PagerParams & { orderId?: number }
  ): Promise<PaginatedData<DeliveryNoteItem>> {
    return apiGet<PaginatedData<DeliveryNoteItem>>("/ecom/delivery-notes", {
      params,
    });
  },

  createDeliveryNote(payload: {
    orderId: number;
    content?: string;
    status?: string;
    shippedAt?: string;
  }): Promise<DeliveryNoteItem> {
    return apiPost<DeliveryNoteItem>("/ecom/delivery-notes", payload);
  },

  updateDeliveryNote(
    id: number,
    payload: Partial<{
      orderId: number;
      content: string;
      status: string;
      shippedAt: string;
    }>
  ): Promise<DeliveryNoteItem> {
    return apiPatch<DeliveryNoteItem>(`/ecom/delivery-notes/${id}`, payload);
  },

  deleteDeliveryNote(id: number): Promise<void> {
    return apiDelete(`/ecom/delivery-notes/${id}`);
  },

  updateInventory(
    productId: number,
    payload: { stock?: number; delta?: number }
  ): Promise<ProductItem> {
    return apiPatch<ProductItem>(`/ecom/inventory/${productId}`, payload);
  },
};

export interface DeliveryNoteItem {
  id: number;
  orderId: number;
  content?: string;
  status: string;
  shippedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
