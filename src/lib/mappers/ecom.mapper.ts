import type {
  CustomFieldDataType,
  EcomCategoryItem,
  EcomCustomFieldItem,
  EcomReviewItem,
  EcomTagItem,
  OrderItem as ApiOrderItem,
  ProductItem as ApiProductItem,
} from "@liora/api-types";
import type { OrderItem as FeOrderItem } from "@/components/sales/dung-chung/types";

function formatViDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return (
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    ", " +
    date.toLocaleDateString("vi-VN")
  );
}

const ORDER_FIELD_TYPE_TO_FE: Record<CustomFieldDataType, string> = {
  TEXT: "Dòng văn bản",
  NUMBER: "Số",
  DATE: "Ngày tháng",
  LIST: "Danh sách chọn",
  BOOLEAN: "Đúng / Sai",
};

const PRODUCT_FIELD_TYPE_TO_FE: Record<CustomFieldDataType, string> = {
  TEXT: "Dòng văn bản",
  NUMBER: "Số",
  DATE: "Ngày/Giờ",
  LIST: "Danh sách",
  BOOLEAN: "True/False",
};

const ORDER_FIELD_TYPE_TO_BE: Record<string, CustomFieldDataType> = {
  "Dòng văn bản": "TEXT",
  "Đoạn văn bản": "TEXT",
  Số: "NUMBER",
  "Ngày tháng": "DATE",
  "Đúng / Sai": "BOOLEAN",
  "Danh sách chọn": "LIST",
};

const PRODUCT_FIELD_TYPE_TO_BE: Record<string, CustomFieldDataType> = {
  "Dòng văn bản": "TEXT",
  "Đoạn văn bản": "TEXT",
  Số: "NUMBER",
  "Ngày/Giờ": "DATE",
  "True/False": "BOOLEAN",
  "Danh sách": "LIST",
};

export function mapApiOrderToFe(order: ApiOrderItem): FeOrderItem {
  return {
    id: String(order.id),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    productName: order.productName,
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: formatViDate(order.createdAt),
    orderId: order.orderId,
    salesChannel: order.source,
    staff: order.assigneeName,
  };
}

export function mapApiOrdersToFe(orders: ApiOrderItem[]): FeOrderItem[] {
  return orders.map(mapApiOrderToFe);
}

export function mapApiTagToOrderFe(tag: EcomTagItem) {
  return {
    id: String(tag.id),
    name: tag.name,
    color: tag.color ?? "#e5e7eb",
    orderCount: tag.count,
    createdAt: formatViDate(tag.createdAt),
    updatedAt: formatViDate(tag.updatedAt),
  };
}

export function mapApiTagToProductFe(tag: EcomTagItem) {
  return {
    id: String(tag.id),
    name: tag.name,
    productCount: tag.count,
    createdAt: formatViDate(tag.createdAt),
    updatedAt: formatViDate(tag.updatedAt),
  };
}

export function mapApiCustomFieldToOrderFe(field: EcomCustomFieldItem) {
  return {
    id: String(field.id),
    displayName: field.displayName,
    fieldName: field.fieldName,
    dataType: ORDER_FIELD_TYPE_TO_FE[field.dataType] ?? "Dòng văn bản",
    updatedAt: formatViDate(field.updatedAt),
  };
}

export function mapApiCustomFieldToProductFe(field: EcomCustomFieldItem) {
  return {
    id: String(field.id),
    displayName: field.displayName,
    fieldName: field.fieldName,
    dataType: (PRODUCT_FIELD_TYPE_TO_FE[field.dataType] ??
      "Dòng văn bản") as
      | "Dòng văn bản"
      | "Đoạn văn bản"
      | "Số"
      | "Ngày/Giờ"
      | "True/False"
      | "Danh sách",
    updatedAt: formatViDate(field.updatedAt),
  };
}

export function mapOrderFieldTypeToBe(label: string): CustomFieldDataType {
  return ORDER_FIELD_TYPE_TO_BE[label] ?? "TEXT";
}

export function mapProductFieldTypeToBe(label: string): CustomFieldDataType {
  return PRODUCT_FIELD_TYPE_TO_BE[label] ?? "TEXT";
}

export function mapApiCategoryToFe(category: EcomCategoryItem) {
  return {
    id: String(category.id),
    name: category.name,
    imageUrl: category.imageUrl ?? "",
    parentId: category.parentId != null ? String(category.parentId) : null,
    visible: category.visible,
    productCount: category.productCount,
    updatedAt: formatViDate(category.updatedAt),
  };
}

export type FeProductStatus = "visible" | "hidden" | "out_of_stock";

export function mapApiProductStatus(
  status?: string,
  stock?: number
): FeProductStatus {
  if (stock === 0) return "out_of_stock";
  if (status === "INACTIVE") return "hidden";
  return "visible";
}

export function mapFeProductStatusToBe(status: FeProductStatus): string {
  if (status === "hidden") return "INACTIVE";
  return "ACTIVE";
}

export function mapApiProductToFe(product: ApiProductItem) {
  const stock = product.stock ?? 0;
  return {
    id: String(product.id),
    name: product.name,
    sku: product.sku,
    price: product.price ?? 0,
    stock,
    type: product.type ?? "physical",
    typeName: product.typeName ?? "Sản phẩm vật lý",
    status: mapApiProductStatus(
      typeof product.status === "string" ? product.status : undefined,
      stock
    ),
    createdAt: product.createdAt ? formatViDate(product.createdAt) : formatViDate(new Date()),
  };
}

export function mapApiReviewToFe(review: EcomReviewItem) {
  return {
    id: String(review.id),
    customerName: review.reviewerName ?? "Khách hàng",
    avatarUrl: review.avatarUrl ?? "",
    rating: review.rating,
    content: review.content ?? "",
    productNames: review.productNames ?? [],
    createdAt: formatViDate(review.createdAt),
    imageUrls: review.imageUrls ?? [],
    productId: review.productId,
  };
}
