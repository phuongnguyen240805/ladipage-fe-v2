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
import { apiDelete, apiGet, apiPatch, apiPost } from "../api-client";

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  paymentMethod?: string;
}

export interface PagerParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const ecomApi = {
  listOrders(params?: OrderListParams): Promise<PaginatedData<OrderItem>> {
    return apiGet<PaginatedData<OrderItem>>("/ecom/orders", { params });
  },

  createOrder(payload: CreateOrderPayload): Promise<OrderItem> {
    const quantity = Math.max(1, payload.quantity);
    const unitPrice =
      quantity > 0 ? payload.totalPrice / quantity : payload.totalPrice;

    return apiPost<OrderItem>("/ecom/orders", {
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      paymentMethod: payload.paymentMethod,
      items: [
        {
          productName: payload.productName,
          quantity,
          unitPrice,
        },
      ],
    });
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
};