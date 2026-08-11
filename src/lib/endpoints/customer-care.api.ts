import type {
  CustomerCareCapabilities,
  CustomerCareAttachment,
  CustomerCareChannelAccount,
  CustomerCareConversation,
  CustomerCareMessage,
  CustomerCareSyncPage,
  CustomerCareTag,
} from "@liora/api-types";
import {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api-client";
import { buildCreateOrderRequestBody } from "./create-order-body";
import type { CreateOrderPayload, CreatedOrderResponse } from "./ecom.api";


export interface CustomerCareAiFact {
  type: string;
  id?: string | number;
  label?: string;
  [key: string]: unknown;
}

export interface CustomerCareAiReplyResult {
  jobId: string;
  resultId: string;
  reply: string;
  intent: string;
  confidence: number;
  needsHuman: boolean;
  summary: string;
  suggestedNextAction: string | null;
  facts: CustomerCareAiFact[];
  proposedActions?: Array<{
    id: string;
    actionType: string;
    riskLevel: string;
    status: string;
    arguments: Record<string, unknown>;
    policyResult?: Record<string, unknown>;
  }>;
}

export interface CustomerCareAiJobDetail {
  job: Record<string, unknown>;
  results: Array<Record<string, unknown>>;
  toolCalls: Array<Record<string, unknown>>;
}

export interface CustomerCareConversationParams {
  cursor?: string;
  search?: string;
  status?: string;
  channel?: string;
  assigneeId?: string;
  tagId?: string;
  channelAccountId?: number;
  limit?: number;
}

export interface CustomerCareCursorPage<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}

function toQuery(params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export const customerCareApi = {
  health: () => apiGet<Record<string, unknown>>("/customer-care/health"),
  capabilities: () => apiGet<CustomerCareCapabilities>("/customer-care/capabilities"),

  listChannels: () => apiGet<CustomerCareChannelAccount[]>("/customer-care/channels"),
  createChannel: (provider: "zalo_personal" | "facebook_personal", name?: string) =>
    apiPost<CustomerCareChannelAccount>("/customer-care/channels", { provider, name }),
  deleteChannel: (id: string) => apiDelete(`/customer-care/channels/${encodeURIComponent(id)}`),
  getZaloStatus: async (id: string) => {
    const channel = await apiGet<CustomerCareChannelAccount>(`/customer-care/channels/${id}/status`);
    return {
      phase: channel.status.phase ?? "starting",
      account_id: String(channel.status.account_id ?? channel.externalAccountId),
      profile: channel.status.profile,
      last_connected_at: channel.status.last_connected_at as string | undefined,
      last_message_at: channel.status.last_message_at as string | undefined,
      last_error: channel.status.last_error as string | undefined,
      qr_available: Boolean(channel.status.qr_available),
      duplicate_of_channel_id: channel.status.duplicate_of_channel_id as string | undefined,
      channelId: channel.id,
    };
  },
  refreshZaloQr: async (id: string) => {
    await apiPost(`/customer-care/channels/${id}/session/reset`);
    return customerCareApi.getZaloStatus(id);
  },
  disconnectZaloSession: async (id: string) => {
    await apiDelete(`/customer-care/channels/${id}/session`);
    return customerCareApi.getZaloStatus(id);
  },
  getZaloQrBlob: async (id: string) => {
    const response = await apiClient.get<Blob>(`/customer-care/channels/${id}/qr?t=${Date.now()}`, {
      responseType: "blob",
      headers: { Accept: "image/png" },
    });
    return response.data;
  },
  getFacebookStatus: async (id: string) => {
    const channel = await apiGet<CustomerCareChannelAccount>(`/customer-care/channels/${id}/status`);
    return {
      phase: channel.status.phase ?? "disconnected",
      account_id: String(channel.status.account_id ?? channel.externalAccountId),
      profile: channel.status.profile,
      last_connected_at: channel.status.last_connected_at as string | undefined,
      last_message_at: channel.status.last_message_at as string | undefined,
      last_error: channel.status.last_error as string | undefined,
      duplicate_of_channel_id: channel.status.duplicate_of_channel_id as string | undefined,
      channelId: channel.id,
    };
  },
  loginFacebook: async (id: string, cookie: string) => {
    const channel = await apiPost<CustomerCareChannelAccount>(
      `/customer-care/channels/${id}/facebook/session`,
      { cookie },
    );
    return {
      phase: channel.status.phase ?? "disconnected",
      account_id: String(channel.status.account_id ?? channel.externalAccountId),
      profile: channel.status.profile,
      last_connected_at: channel.status.last_connected_at as string | undefined,
      last_message_at: channel.status.last_message_at as string | undefined,
      last_error: channel.status.last_error as string | undefined,
      duplicate_of_channel_id: channel.status.duplicate_of_channel_id as string | undefined,
      channelId: channel.id,
    };
  },
  disconnectFacebookSession: async (id: string) => {
    await apiDelete(`/customer-care/channels/${id}/session`);
    return customerCareApi.getFacebookStatus(id);
  },

  listConversations: (params?: CustomerCareConversationParams) =>
    apiGet<CustomerCareCursorPage<CustomerCareConversation>>(
      `/customer-care/conversations${toQuery(params as Record<string, string | number | undefined>)}`
    ),
  getConversation: (conversationId: string) =>
    apiGet<CustomerCareConversation>(`/customer-care/conversations/${encodeURIComponent(conversationId)}`),
  updateConversation: (conversationId: string, patch: Record<string, unknown>) =>
    apiPatch(`/customer-care/conversations/${encodeURIComponent(conversationId)}`, patch),
  deleteConversation: (conversationId: string, channelAccountId?: string) =>
    apiDelete(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}${toQuery({
        channelAccountId: channelAccountId || undefined,
      })}`,
    ),
  markRead: (conversationId: string) =>
    apiPost(`/customer-care/conversations/${encodeURIComponent(conversationId)}/read`),
  markUnread: (conversationId: string) =>
    apiPost(`/customer-care/conversations/${encodeURIComponent(conversationId)}/unread`),
  assign: (conversationId: string, assigneeId: number | null) =>
    assigneeId == null
      ? apiDelete(`/customer-care/conversations/${encodeURIComponent(conversationId)}/assignee`)
      : apiPut(`/customer-care/conversations/${encodeURIComponent(conversationId)}/assignee`, { assigneeId }),
  setTeam: (conversationId: string, teamId: number | null) =>
    teamId == null
      ? apiDelete(`/customer-care/conversations/${encodeURIComponent(conversationId)}/team`)
      : apiPut(`/customer-care/conversations/${encodeURIComponent(conversationId)}/team`, { teamId }),
  setTags: (conversationId: string, tags: Array<string | number>, action = "set") =>
    apiPut(`/customer-care/conversations/${encodeURIComponent(conversationId)}/tags`, { tags, action }),
  listParticipants: (conversationId: string) =>
    apiGet(`/customer-care/conversations/${encodeURIComponent(conversationId)}/participants`),
  listPrevious: (conversationId: string) =>
    apiGet<CustomerCareConversation[]>(`/customer-care/conversations/${encodeURIComponent(conversationId)}/previous`),
  createConversationOrder: (conversationId: string, payload: CreateOrderPayload) =>
    apiPost<CreatedOrderResponse>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/orders`,
      buildCreateOrderRequestBody(payload)
    ),
  getConversationContext: (conversationId: string) =>
    apiGet<Record<string, unknown>>(`/customer-care/conversations/${encodeURIComponent(conversationId)}/context`),
  getConversationTimeline: (conversationId: string) =>
    apiGet<Array<Record<string, unknown>>>(`/customer-care/conversations/${encodeURIComponent(conversationId)}/timeline`),
  generateAiReply: (conversationId: string, input: { instruction?: string; triggerMessageId?: string } = {}) =>
    apiPost<CustomerCareAiReplyResult>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/ai/reply`,
      input,
    ),
  analyzeConversation: (conversationId: string, input: { triggerMessageId?: string } = {}) =>
    apiPost<CustomerCareAiReplyResult>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/ai/analyze`,
      input,
    ),
  getAiJob: (jobId: string) =>
    apiGet<CustomerCareAiJobDetail>(`/customer-care/ai/jobs/${encodeURIComponent(jobId)}`),
  sendAiFeedback: (resultId: string, input: { rating: -1 | 0 | 1; reason?: string; editedContent?: string }) =>
    apiPost(`/customer-care/ai/results/${encodeURIComponent(resultId)}/feedback`, input),
  listAiActions: (conversationId: string) =>
    apiGet<NonNullable<CustomerCareAiReplyResult["proposedActions"]>>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/ai/actions`,
    ),
  approveAiAction: (actionId: string, reason?: string) =>
    apiPost<NonNullable<CustomerCareAiReplyResult["proposedActions"]>[number]>(
      `/customer-care/ai/actions/${encodeURIComponent(actionId)}/approve`,
      { reason },
    ),
  rejectAiAction: (actionId: string, reason?: string) =>
    apiPost<NonNullable<CustomerCareAiReplyResult["proposedActions"]>[number]>(
      `/customer-care/ai/actions/${encodeURIComponent(actionId)}/reject`,
      { reason },
    ),

  listMessages: (conversationId: string, cursor?: string) =>
    apiGet<CustomerCareCursorPage<CustomerCareMessage>>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/messages${toQuery({ cursor })}`
    ),
  getMessage: (conversationId: string, messageId: string) =>
    apiGet<CustomerCareMessage>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`
    ),
  sendMessage: (
    conversationId: string,
    input: { clientMessageId: string; content: string; type?: string; replyToMessageId?: string; attachments?: number[] }
  ) =>
    apiPost<CustomerCareMessage>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/messages`,
      input,
      { headers: { "Idempotency-Key": input.clientMessageId } }
    ),
  uploadMedia: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post<Omit<CustomerCareAttachment, "id"> & { id: number }>(
      "/customer-care/media",
      form
    );
    return response.data;
  },
  retryMessage: (conversationId: string, messageId: string) =>
    apiPost(`/customer-care/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/retry`),
  recallMessage: (conversationId: string, messageId: string) =>
    apiPost(`/customer-care/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/recall`),
  forwardMessage: (conversationId: string, messageId: string, targetConversationId: string, content?: string) =>
    apiPost<CustomerCareMessage>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/forward`,
      { targetConversationId, content }
    ),
  addReaction: (conversationId: string, messageId: string, emoji: string) =>
    apiPut(`/customer-care/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/reactions/${encodeURIComponent(emoji)}`),
  removeReaction: (conversationId: string, messageId: string, emoji: string) =>
    apiDelete(`/customer-care/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/reactions/${encodeURIComponent(emoji)}`),

  getDraft: (conversationId: string) =>
    apiGet<{ content: string; attachments: unknown[] }>(`/customer-care/conversations/${encodeURIComponent(conversationId)}/draft`),
  saveDraft: (conversationId: string, content: string, attachments: unknown[] = []) =>
    apiPut(`/customer-care/conversations/${encodeURIComponent(conversationId)}/draft`, { content, attachments }),
  deleteDraft: (conversationId: string) =>
    apiDelete(`/customer-care/conversations/${encodeURIComponent(conversationId)}/draft`),

  getContact: (contactId: string) => apiGet(`/customer-care/contacts/${encodeURIComponent(contactId)}`),
  updateContact: (contactId: string, patch: Record<string, unknown>) =>
    apiPatch(`/customer-care/contacts/${encodeURIComponent(contactId)}`, patch),
  contactConversations: (contactId: string) =>
    apiGet<CustomerCareConversation[]>(`/customer-care/contacts/${encodeURIComponent(contactId)}/conversations`),
  contactOrders: (contactId: string) => apiGet(`/customer-care/contacts/${encodeURIComponent(contactId)}/orders`),

  agents: () => apiGet<Array<{ id: number; first_name: string; last_name: string; avatar_url?: string }>>("/customer-care/agents"),
  teams: () => apiGet<Array<{ id: number; name: string }>>("/customer-care/teams"),
  tags: () => apiGet<CustomerCareTag[]>("/customer-care/tags"),
  sync: (afterSequence = 0, limit = 500) =>
    apiGet<CustomerCareSyncPage>(`/customer-care/sync${toQuery({ afterSequence, limit })}`),
};

