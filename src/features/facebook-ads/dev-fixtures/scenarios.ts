import type {
  FacebookAdsConnectionStatus,
  FacebookAdsDataState,
  FacebookAdsScenarioId,
} from "../contracts/runtime";

export type FacebookAdsScenario = {
  id: FacebookAdsScenarioId;
  label: string;
  shortLabel: string;
  description: string;
  connectionStatus: FacebookAdsConnectionStatus;
  dataState: FacebookAdsDataState;
};

export const FACEBOOK_ADS_SCENARIOS: readonly FacebookAdsScenario[] = [
  {
    id: "happy",
    label: "Dữ liệu đầy đủ",
    shortLabel: "Ready",
    description: "Kết nối ổn định và có đủ dữ liệu mock để duyệt UI.",
    connectionStatus: "connected",
    dataState: "ready",
  },
  {
    id: "loading",
    label: "Đang tải",
    shortLabel: "Loading",
    description: "Kiểm tra skeleton khi đồng bộ tài khoản và chiến dịch.",
    connectionStatus: "connected",
    dataState: "loading",
  },
  {
    id: "empty",
    label: "Chưa có dữ liệu",
    shortLabel: "Empty",
    description: "Kết nối hợp lệ nhưng chưa có tài khoản hoặc chiến dịch.",
    connectionStatus: "connected",
    dataState: "empty",
  },
  {
    id: "stale",
    label: "Dữ liệu đã cũ",
    shortLabel: "Stale",
    description: "Vẫn hiển thị cache gần nhất và yêu cầu đồng bộ lại.",
    connectionStatus: "connected",
    dataState: "stale",
  },
  {
    id: "disconnected",
    label: "Chưa kết nối Meta",
    shortLabel: "Disconnected",
    description: "Kiểm tra onboarding khi workspace chưa kết nối Meta.",
    connectionStatus: "disconnected",
    dataState: "blocked",
  },
  {
    id: "permission-denied",
    label: "Thiếu quyền",
    shortLabel: "Permission",
    description: "Meta connection còn hiệu lực nhưng thiếu quyền quảng cáo.",
    connectionStatus: "permission-required",
    dataState: "blocked",
  },
  {
    id: "rate-limited",
    label: "Meta giới hạn tần suất",
    shortLabel: "Rate limit",
    description: "Hiển thị cache an toàn trong lúc chờ đồng bộ lại.",
    connectionStatus: "connected",
    dataState: "stale",
  },
  {
    id: "partial",
    label: "Dữ liệu một phần",
    shortLabel: "Partial",
    description: "Một số tài sản chưa tải được nhưng phần còn lại vẫn dùng được.",
    connectionStatus: "connected",
    dataState: "partial",
  },
] as const;

export const DEFAULT_FACEBOOK_ADS_SCENARIO: FacebookAdsScenarioId = "happy";

export function isFacebookAdsScenarioId(
  value: string | null | undefined,
): value is FacebookAdsScenarioId {
  return FACEBOOK_ADS_SCENARIOS.some((scenario) => scenario.id === value);
}

export function getFacebookAdsScenario(
  scenarioId: FacebookAdsScenarioId,
): FacebookAdsScenario {
  return (
    FACEBOOK_ADS_SCENARIOS.find((scenario) => scenario.id === scenarioId) ??
    FACEBOOK_ADS_SCENARIOS[0]
  );
}

