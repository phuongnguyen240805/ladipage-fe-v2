import type {
  CustomerCareCapabilities,
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

export interface CustomerCareConversationParams {
  cursor?: string;
  search?: string;
  status?: string;
  channel?: string;
  assigneeId?: string;
  tagId?: string;
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

let primaryChannelId: string | null = null;
async function resolvePrimaryChannelId() {
  if (primaryChannelId) return primaryChannelId;
  const channels = await apiGet<CustomerCareChannelAccount[]>("/customer-care/channels");
  const channel = channels.find((item) => item.provider === "zalo_personal") ?? channels[0];
  if (!channel) throw new Error("Chưa cấu hình tài khoản kênh CSKH.");
  primaryChannelId = channel.id;
  return primaryChannelId;
}

export const customerCareApi = {
  health: () => apiGet<Record<string, unknown>>("/customer-care/health"),
  capabilities: () => apiGet<CustomerCareCapabilities>("/customer-care/capabilities"),

  listChannels: () => apiGet<CustomerCareChannelAccount[]>("/customer-care/channels"),
  getZaloStatus: async () => {
    const id = await resolvePrimaryChannelId();
    const channel = await apiGet<CustomerCareChannelAccount>(`/customer-care/channels/${id}/status`);
    return {
      phase: channel.status.phase ?? "starting",
      account_id: String(channel.status.account_id ?? channel.externalAccountId),
      profile: channel.status.profile,
      last_connected_at: channel.status.last_connected_at as string | undefined,
      last_message_at: channel.status.last_message_at as string | undefined,
      last_error: channel.status.last_error as string | undefined,
      qr_available: Boolean(channel.status.qr_available),
      channelId: channel.id,
    };
  },
  refreshZaloQr: async () => {
    const id = await resolvePrimaryChannelId();
    await apiPost(`/customer-care/channels/${id}/session/reset`);
    return customerCareApi.getZaloStatus();
  },
  getZaloQrBlob: async () => {
    const id = await resolvePrimaryChannelId();
    const response = await apiClient.get<Blob>(`/customer-care/channels/${id}/qr?t=${Date.now()}`, {
      responseType: "blob",
      headers: { Accept: "image/png" },
    });
    return response.data;
  },

  listConversations: (params?: CustomerCareConversationParams) =>
    apiGet<CustomerCareCursorPage<CustomerCareConversation>>(
      `/customer-care/conversations${toQuery(params as Record<string, string | number | undefined>)}`
    ),
  getConversation: (conversationId: string) =>
    apiGet<CustomerCareConversation>(`/customer-care/conversations/${encodeURIComponent(conversationId)}`),
  updateConversation: (conversationId: string, patch: Record<string, unknown>) =>
    apiPatch(`/customer-care/conversations/${encodeURIComponent(conversationId)}`, patch),
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
    input: { clientMessageId: string; content: string; type?: string; replyToMessageId?: string }
  ) =>
    apiPost<CustomerCareMessage>(
      `/customer-care/conversations/${encodeURIComponent(conversationId)}/messages`,
      input,
      { headers: { "Idempotency-Key": input.clientMessageId } }
    ),
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
