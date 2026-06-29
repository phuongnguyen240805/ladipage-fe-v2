import type {
  CustomerItem as ApiCustomerItem,
  CustomFieldItem as ApiCustomFieldItem,
  SegmentItem as ApiSegmentItem,
  TagItem as ApiTagItem,
} from "@liora/api-types";
type CustomFieldDataType = "TEXT" | "NUMBER" | "DATE" | "LIST" | "BOOLEAN";
import type {
  CustomFieldItem as FeCustomFieldItem,
  CustomFieldType,
  CustomerItem as FeCustomerItem,
  SegmentItem as FeSegmentItem,
  TagItem as FeTagItem,
} from "@/components/customers/dung-chung/types";

function formatViDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return (
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    " " +
    date.toLocaleDateString("vi-VN")
  );
}

const CUSTOM_FIELD_TYPE_TO_FE: Record<string, CustomFieldType> = {
  TEXT: "Chữ",
  NUMBER: "Số",
  DATE: "Ngày tháng",
  LIST: "Danh sách",
  BOOLEAN: "Đúng/Sai",
};

const CUSTOM_FIELD_TYPE_TO_BE: Record<string, CustomFieldDataType> = {
  Chữ: "TEXT",
  Số: "NUMBER",
  "Ngày tháng": "DATE",
  "Danh sách": "LIST",
  "Đúng/Sai": "BOOLEAN",
};

export function mapApiCustomerToFe(
  customer: ApiCustomerItem & { tags?: string[] }
): FeCustomerItem {
  return {
    id: String(customer.id),
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    status: customer.status,
    createdAt: formatViDate(customer.createdAt),
    segment: customer.segment,
    tags: customer.tags ?? [],
  };
}

export function mapApiCustomersToFe(
  customers: (ApiCustomerItem & { tags?: string[] })[]
): FeCustomerItem[] {
  return customers.map(mapApiCustomerToFe);
}

export function mapApiSegmentToFe(segment: ApiSegmentItem): FeSegmentItem {
  return {
    id: String(segment.id),
    name: segment.name,
    isDefault: segment.isDefault,
    customerCount: segment.customerCount,
    createdAt: formatViDate(segment.createdAt),
    updatedAt: formatViDate(segment.updatedAt),
  };
}

export function mapApiTagToFe(tag: ApiTagItem): FeTagItem {
  return {
    id: String(tag.id),
    name: tag.name,
    count: tag.count,
    createdAt: formatViDate(tag.createdAt),
    updatedAt: formatViDate(tag.updatedAt),
  };
}

export function mapApiCustomFieldToFe(
  field: ApiCustomFieldItem & { description?: string }
): FeCustomFieldItem {
  const rawType = String(field.dataType);
  return {
    id: String(field.id),
    displayName: field.displayName,
    fieldName: field.fieldName,
    dataType: CUSTOM_FIELD_TYPE_TO_FE[rawType] ?? "Chữ",
    description: field.description ?? "",
  };
}

export function mapCustomerFieldTypeToBe(label: string): CustomFieldDataType {
  return CUSTOM_FIELD_TYPE_TO_BE[label] ?? "TEXT";
}