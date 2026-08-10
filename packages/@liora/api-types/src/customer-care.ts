export type CustomerCareChannel =
  | "facebook"
  | "instagram"
  | "zalo"
  | "telegram"
  | "whatsapp"
  | "tiktok"
  | "website";

export type CustomerCareConversationStatus =
  | "unread"
  | "open"
  | "pending"
  | "resolved";

export type CustomerCareMessageDirection = "incoming" | "outgoing";
export type CustomerCareMessageStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "recalled";
export type CustomerCareMessageType = "text" | "image" | "file" | "sticker" | "system";

export interface CustomerCareTag {
  id: string;
  name: string;
  color: string;
}

export interface CustomerCareAssignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface CustomerCareCustomer {
  id: string;
  externalId?: string;
  provider?: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  location?: string;
  note?: string;
  crmCustomerId?: number;
  crmContactId?: string | number;
  totalOrders: number;
  totalSpent: number;
  tags: CustomerCareTag[];
  assignee?: CustomerCareAssignee;
}

export interface CustomerCareConversation {
  id: string;
  externalThreadId?: string;
  threadType?: "user" | "group";
  customer: CustomerCareCustomer;
  channel: CustomerCareChannel;
  /** Provider runtime, e.g. zalo_personal / facebook_personal / telegram_bot. */
  channelProvider?: string;
  /** Exact account/session that owns this conversation. */
  channelAccountId?: string;
  channelAccountName?: string;
  channelName?: string;
  status: CustomerCareConversationStatus;
  priority?: "low" | "normal" | "high" | "urgent" | string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  waitingSince?: string;
  postTitle?: string;
  tags: CustomerCareTag[];
  assignee?: CustomerCareAssignee;
  teamId?: string;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  typing?: boolean;
  updatedAt?: string;
}

export interface CustomerCareAttachment {
  id: string;
  name: string;
  type: "image" | "file";
  mimeType?: string;
  size?: number;
  url?: string;
  thumbnailUrl?: string;
}

export interface CustomerCareMessageReaction {
  emoji: string;
  count: number;
  reactedByMe?: boolean;
}

export interface CustomerCareMessageReply {
  id: string;
  senderName?: string;
  content: string;
}

export interface CustomerCareMessage {
  id: string;
  clientMessageId?: string;
  externalMessageId?: string;
  conversationId: string;
  direction: CustomerCareMessageDirection;
  type?: CustomerCareMessageType;
  content: string;
  createdAt: string;
  updatedAt?: string;
  sender?: {
    id?: string;
    externalId?: string;
    name: string;
    avatar?: string;
  };
  senderName: string;
  senderAvatar?: string;
  status: CustomerCareMessageStatus;
  attachments?: CustomerCareAttachment[];
  replyTo?: CustomerCareMessageReply;
  reactions?: CustomerCareMessageReaction[];
  recalled?: boolean;
  edited?: boolean;
  error?: string;
}

export type ZaloConnectorPhase =
  | "starting"
  | "qr_ready"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface CustomerCareChannelAccount {
  id: string;
  provider: string;
  externalAccountId: string;
  name: string;
  enabled: boolean;
  status: {
    phase?: ZaloConnectorPhase;
    account_id?: string;
    profile?: unknown;
    last_connected_at?: string;
    last_message_at?: string;
    last_error?: string;
    qr_available?: boolean;
    [key: string]: unknown;
  };
}

export interface CustomerCareCapabilities {
  messages: {
    text: boolean;
    image: boolean;
    file: boolean;
    sticker: boolean;
    reply: boolean;
    forward: boolean;
    retry: boolean;
    recall: { local: boolean; native: boolean };
    reactions: { local: boolean; native: boolean };
  };
  conversations: {
    assignment: boolean;
    teams: boolean;
    tags: boolean;
    priority: boolean;
    readState: boolean;
    pin: boolean;
    mute: boolean;
    archive: boolean;
    drafts: boolean;
  };
  realtime: boolean;
  offlineCache: boolean;
  historyImport: boolean;
}

export interface CustomerCareSyncEvent {
  eventId: string;
  sequence: number;
  type: string;
  aggregateId?: string | null;
  occurredAt: string;
  data: Record<string, unknown>;
}

export interface CustomerCareSyncPage {
  events: CustomerCareSyncEvent[];
  cursor: number;
  hasMore: boolean;
  resetRequired?: boolean;
  serverTime: string;
}

export interface CustomerCareDateRange {
  from: string;
  to: string;
  preset?: "today" | "yesterday" | "7d" | "30d" | "90d";
}

export interface CustomerCareOverviewMetric {
  label: string;
  value: number;
  change: number;
}

export interface CustomerCareOverviewPoint {
  label: string;
  customers: number;
  conversations: number;
  messages: number;
  orders: number;
}

export interface CustomerCareTopTag {
  tag: CustomerCareTag;
  usage: number;
}

export interface CustomerCareStaffMetric {
  id: string;
  name: string;
  avatar?: string;
  handled: number;
  responseRate: number;
  avgResponseMinutes: number;
}

export interface CustomerCareOverview {
  metrics: CustomerCareOverviewMetric[];
  activity: CustomerCareOverviewPoint[];
  topTags: CustomerCareTopTag[];
  staff: CustomerCareStaffMetric[];
  hourlyEngagement: number[];
  page: { messages: number; comments: number };
  engagement: {
    total: number;
    messages: number;
    comments: number;
    newConversations: number;
    responseRate: number;
    avgResponseMinutes: number;
  };
}

export interface CustomerCareWorkingShift { id: string; from: string; to: string }
export interface CustomerCareWorkingDay { day: number; enabled: boolean; shifts: CustomerCareWorkingShift[] }

export interface CustomerCareSettings {
  browserNotifications: boolean;
  notificationSound: boolean;
  prioritizeUnread: boolean;
  jumpToUnread: boolean;
  conversationTasks: boolean;
  groupImages: boolean;
  ignoreSticker: boolean;
  ignoreSpam: boolean;
  autoSaveCustomer: boolean;
  autoAssign: boolean;
  autoMarkRead: boolean;
  autoCreateLead: boolean;
  autoTagRules: boolean;
  outsideHoursReply: boolean;
  outsideHoursMessage: string;
  timezone: string;
  workingDays: CustomerCareWorkingDay[];
  integrations: Record<string, boolean>;
}
