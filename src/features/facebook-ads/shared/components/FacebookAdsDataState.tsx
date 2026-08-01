import {
  AlertTriangle,
  DatabaseZap,
  Link2Off,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import type { FacebookAdsScenarioId } from "../../contracts/runtime";

const stateCopy: Partial<
  Record<
    FacebookAdsScenarioId,
    { title: string; description: string; action: string; icon: typeof AlertTriangle }
  >
> = {
  empty: {
    title: "Chưa có dữ liệu quảng cáo",
    description: "Chọn tài khoản khác hoặc chạy đồng bộ mock để kiểm tra trạng thái có dữ liệu.",
    action: "Đồng bộ dữ liệu mock",
    icon: DatabaseZap,
  },
  disconnected: {
    title: "Workspace chưa kết nối Meta",
    description: "Kết nối Meta để tải tài khoản, tài sản và chiến dịch. Preview hiện không mở OAuth thật.",
    action: "Xem màn hình kết nối",
    icon: Link2Off,
  },
  "permission-denied": {
    title: "Thiếu quyền quản lý quảng cáo",
    description: "Tài khoản hiện tại chưa có quyền ads_management hoặc quyền trên tài khoản quảng cáo.",
    action: "Kiểm tra quyền mock",
    icon: ShieldAlert,
  },
};

export function FacebookAdsLoadingState() {
  return (
    <div className="adsmeta-state-panel is-loading" role="status">
      <LoaderCircle aria-hidden="true" className="animate-spin" size={22} />
      <b>Đang tải dữ liệu Facebook Ads…</b>
      <span>Đang dựng tài khoản, tài sản và campaign hierarchy từ fixture.</span>
      <div className="adsmeta-state-skeleton" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <i key={index} />)}
      </div>
    </div>
  );
}

export function FacebookAdsBlockingState({ scenario }: { scenario: FacebookAdsScenarioId }) {
  const copy = stateCopy[scenario] ?? stateCopy.empty!;
  const Icon = copy.icon;

  return (
    <div className="adsmeta-state-panel" role="status">
      <span className="adsmeta-state-icon"><Icon aria-hidden="true" size={22} /></span>
      <b>{copy.title}</b>
      <span>{copy.description}</span>
      <button type="button"><RefreshCw aria-hidden="true" size={13} />{copy.action}</button>
      <small>Chỉ mô phỏng giao diện · không gửi yêu cầu đến Meta</small>
    </div>
  );
}

export function FacebookAdsInlineState({ scenario }: { scenario: FacebookAdsScenarioId }) {
  if (!(["stale", "rate-limited", "partial"] as FacebookAdsScenarioId[]).includes(scenario)) {
    return null;
  }

  const content = scenario === "partial"
    ? ["Một phần dữ liệu chưa tải được", "2 tài sản không khả dụng; bảng vẫn hiển thị dữ liệu hợp lệ."]
    : scenario === "rate-limited"
      ? ["Meta đang giới hạn tần suất", "Đang dùng cache mock gần nhất; thử đồng bộ lại sau 12 phút."]
      : ["Dữ liệu cần đồng bộ lại", "Snapshot mock được ghi nhận 27 phút trước."];

  return (
    <div className={`adsmeta-inline-state is-${scenario}`} role="status">
      <AlertTriangle aria-hidden="true" size={13} />
      <b>{content[0]}</b>
      <span>{content[1]}</span>
      <button type="button">Tải lại mock</button>
    </div>
  );
}

