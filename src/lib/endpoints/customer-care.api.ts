import type {
  CustomerCareConversation,
  CustomerCareDateRange,
  CustomerCareMessage,
  CustomerCareOverview,
  CustomerCareSettings,
} from "@liora/api-types";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";

export interface CustomerCareConversationParams {
  cursor?: string;
  search?: string;
  status?: string;
  channel?: string;
  assigneeId?: string;
  tagId?: string;
}

export interface CustomerCareCursorPage<T> {
  items: T[];
  nextCursor?: string;
}

export const customerCareApi = {
  listConversations: (params?: CustomerCareConversationParams) =>
    apiGet<CustomerCareCursorPage<CustomerCareConversation>>(
      "/customer-care/conversations",
      { params }
    ),

  listMessages: (conversationId: string, cursor?: string) =>
    apiGet<CustomerCareCursorPage<CustomerCareMessage>>(
      `/customer-care/conversations/${conversationId}/messages`,
      { params: { cursor } }
    ),

  sendMessage: (conversationId: string, content: string) =>
    apiPost<CustomerCareMessage>(
      `/customer-care/conversations/${conversationId}/messages`,
      { content }
    ),

  updateConversation: (
    conversationId: string,
    payload: Partial<Pick<CustomerCareConversation, "status" | "assignee" | "tags">>
  ) =>
    apiPatch<CustomerCareConversation>(
      `/customer-care/conversations/${conversationId}`,
      payload
    ),

  getOverview: (range: CustomerCareDateRange) =>
    apiGet<CustomerCareOverview>("/customer-care/statistics/overview", {
      params: range,
    }),

  getSettings: () =>
    apiGet<CustomerCareSettings>("/customer-care/settings"),

  updateSettings: (payload: CustomerCareSettings) =>
    apiPatch<CustomerCareSettings>("/customer-care/settings", payload),
};
