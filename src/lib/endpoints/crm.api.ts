import type {
  CustomerItem,
  CustomFieldItem,
  PaginatedData,
  SegmentItem,
  TagItem,
} from "@liora/api-types";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api-client";

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CustomerItem["status"];
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  status?: CustomerItem["status"];
  tagIds?: number[];
  segmentIds?: number[];
}

export interface PagerParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const crmApi = {
  listCustomers(
    params?: CustomerListParams
  ): Promise<PaginatedData<CustomerItem>> {
    return apiGet<PaginatedData<CustomerItem>>("/crm/customers", { params });
  },

  createCustomer(payload: CreateCustomerPayload): Promise<CustomerItem> {
    return apiPost<CustomerItem>("/crm/customers", payload);
  },

  updateCustomer(
    id: string,
    payload: Partial<CreateCustomerPayload>
  ): Promise<CustomerItem> {
    return apiPatch<CustomerItem>(`/crm/customers/${id}`, payload);
  },

  deleteCustomer(id: string): Promise<void> {
    return apiDelete(`/crm/customers/${id}`);
  },

  listSegments(params?: PagerParams): Promise<PaginatedData<SegmentItem>> {
    return apiGet<PaginatedData<SegmentItem>>("/crm/segments", { params });
  },

  createSegment(payload: {
    name: string;
    isDefault?: boolean;
  }): Promise<SegmentItem> {
    return apiPost<SegmentItem>("/crm/segments", payload);
  },

  updateSegment(
    id: number,
    payload: Partial<{ name: string; isDefault: boolean }>
  ): Promise<SegmentItem> {
    return apiPatch<SegmentItem>(`/crm/segments/${id}`, payload);
  },

  deleteSegment(id: number): Promise<void> {
    return apiDelete(`/crm/segments/${id}`);
  },

  listTags(params?: PagerParams): Promise<PaginatedData<TagItem>> {
    return apiGet<PaginatedData<TagItem>>("/crm/tags", { params });
  },

  createTag(payload: { name: string }): Promise<TagItem> {
    return apiPost<TagItem>("/crm/tags", payload);
  },

  updateTag(
    id: number,
    payload: Partial<{ name: string }>
  ): Promise<TagItem> {
    return apiPatch<TagItem>(`/crm/tags/${id}`, payload);
  },

  deleteTag(id: number): Promise<void> {
    return apiDelete(`/crm/tags/${id}`);
  },

  listCustomFields(
    params?: PagerParams & { targetType?: "person" | "opportunity" }
  ): Promise<PaginatedData<CustomFieldItem>> {
    return apiGet<PaginatedData<CustomFieldItem>>("/crm/custom-fields", {
      params,
    });
  },

  createCustomField(payload: {
    fieldName: string;
    displayName: string;
    dataType?: string;
    description?: string;
    targetType?: "person" | "opportunity";
    options?: string[];
  }): Promise<CustomFieldItem> {
    return apiPost<CustomFieldItem>("/crm/custom-fields", {
      targetType: "person",
      ...payload,
    });
  },

  updateCustomField(
    id: string,
    payload: Partial<{
      fieldName: string;
      displayName: string;
      dataType: string;
      description: string;
    }>
  ): Promise<CustomFieldItem> {
    return apiPatch<CustomFieldItem>(`/crm/custom-fields/${id}`, payload);
  },

  deleteCustomField(id: string): Promise<void> {
    return apiDelete(`/crm/custom-fields/${id}`);
  },
};