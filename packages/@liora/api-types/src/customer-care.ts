export type CustomerCareChannel =
  | "facebook"
  | "instagram"
  | "zalo"
  | "whatsapp"
  | "tiktok"
  | "website";

export type CustomerCareConversationStatus =
  | "unread"
  | "open"
  | "pending"
  | "resolved";

export type CustomerCareMessageDirection = "incoming" | "outgoing";
export type CustomerCareMessageStatus = "sending" | "sent" | "delivered" | "failed";

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
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  location?: string;
  note?: string;
  totalOrders: number;
  totalSpent: number;
  tags: CustomerCareTag[];
  assignee?: CustomerCareAssignee;
}

export interface CustomerCareConversation {
  id: string;
  customer: CustomerCareCustomer;
  channel: CustomerCareChannel;
  status: CustomerCareConversationStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  waitingSince?: string;
  postTitle?: string;
  tags: CustomerCareTag[];
  assignee?: CustomerCareAssignee;
}

export interface CustomerCareAttachment {
  id: string;
  name: string;
  type: "image" | "file";
  url?: string;
}

export interface CustomerCareMessage {
  id: string;
  conversationId: string;
  direction: CustomerCareMessageDirection;
  content: string;
  createdAt: string;
  senderName: string;
  status: CustomerCareMessageStatus;
  attachments?: CustomerCareAttachment[];
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
  page: {
    messages: number;
    comments: number;
  };
  engagement: {
    total: number;
    messages: number;
    comments: number;
    newConversations: number;
    responseRate: number;
    avgResponseMinutes: number;
  };
}

export interface CustomerCareWorkingShift {
  id: string;
  from: string;
  to: string;
}

export interface CustomerCareWorkingDay {
  day: number;
  enabled: boolean;
  shifts: CustomerCareWorkingShift[];
}

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
