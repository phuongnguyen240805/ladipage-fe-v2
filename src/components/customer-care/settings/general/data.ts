import type { ConversationTag, SettingHistoryItem, SettingView } from "./types";

export const settingViewAliases: Record<string, SettingView> = {
  permissions: "setting_permissions",
  histories: "update_histories",
  history: "update_histories",
  tags: "tag",
};

export const conversationTags: ConversationTag[] = [
  { id: "tag-1", name: "Kiểm hàng", color: "#5B6B9C", enabled: true },
  { id: "tag-2", name: "Câu hỏi", color: "#8E2EB2", enabled: true },
  { id: "tag-3", name: "Mua hàng", color: "#1668DC", enabled: true },
  { id: "tag-4", name: "Đã gửi", color: "#039855", enabled: true },
  { id: "tag-5", name: "Hết hàng", color: "#2E90FA", enabled: true },
  { id: "tag-6", name: "Trả hàng", color: "#D92D20", enabled: true },
  { id: "tag-7", name: "Khách hàng", color: "#B42318", enabled: true },
  { id: "tag-8", name: "Gia đình", color: "#C11574", enabled: true },
  { id: "tag-9", name: "Công việc", color: "#B54708", enabled: true },
  { id: "tag-10", name: "Bạn bè", color: "#A15C07", enabled: true },
  { id: "tag-11", name: "Trả lời sau", color: "#027A48", enabled: true },
  { id: "tag-12", name: "Đồng nghiệp", color: "#175CD3", enabled: true },
];

export const settingHistoryItems: SettingHistoryItem[] = [
  { id: "history-1", actor: "Phương Nguyễn", action: "Bật", target: "Ưu tiên hội thoại chưa đọc", createdAt: "14:32 - 04/08/2026", status: "success" },
  { id: "history-2", actor: "Mai Anh", action: "Cập nhật", target: "Lịch làm việc", createdAt: "11:08 - 04/08/2026", status: "warning" },
  { id: "history-3", actor: "Minh Khang", action: "Tắt", target: "Tự động bỏ qua sticker", createdAt: "09:46 - 03/08/2026", status: "danger" },
  { id: "history-4", actor: "Thu Hà", action: "Thêm", target: "Thẻ hội thoại: Khách VIP", createdAt: "16:20 - 02/08/2026", status: "success" },
];

export const workingDayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
