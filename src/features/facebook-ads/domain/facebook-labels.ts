const labels: Record<string, Record<string, string>> = {
  status: { ACTIVE: "Hoạt động", PAUSED: "Tạm dừng", DISABLED: "Vô hiệu", IN_PROCESS: "Đang xử lý", WITH_ISSUES: "Có vấn đề", PENDING_REVIEW: "Đang xét duyệt", PREAPPROVED: "Đã duyệt trước", DISAPPROVED: "Không được duyệt", PENDING_BILLING_INFO: "Chờ thanh toán", ARCHIVED: "Đã lưu trữ", DELETED: "Đã xóa" },
  objective: { OUTCOME_AWARENESS: "Nhận thức", OUTCOME_TRAFFIC: "Lưu lượng truy cập", OUTCOME_ENGAGEMENT: "Tương tác", OUTCOME_LEADS: "Khách hàng tiềm năng", OUTCOME_SALES: "Doanh số", APP_INSTALLS: "Lượt cài đặt ứng dụng" },
  role: { ADMIN: "Quản trị viên", GENERAL_USER: "Nhà quảng cáo", REPORTS_ONLY: "Nhà phân tích" },
};
export function humanizeFacebookEnum(value: string) { return value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
export function facebookLabel(group: keyof typeof labels, value: string) { return labels[group]?.[value] ?? humanizeFacebookEnum(value); }
