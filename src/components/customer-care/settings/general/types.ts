export type SettingView =
  | "general"
  | "tag"
  | "ai"
  | "reply"
  | "display"
  | "round-robin"
  | "sync"
  | "tools"
  | "setting_permissions"
  | "update_histories";

export type SettingNavigationItem = {
  id: SettingView;
  label: string;
  beta?: boolean;
};

export type ConversationTag = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};

export type QuickReplyTemplate = {
  id: string;
  shortcut: string;
  message: string;
};

export type SyncGroup = {
  id: string;
  name: string;
  updatedAt: string;
  pages: number;
};

export type SettingHistoryItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
  status: "success" | "warning" | "danger";
};
