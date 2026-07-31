export type AdsEntityLevel = "campaign" | "adset" | "ad";

export type AdsDeliveryStatus =
  | "ACTIVE"
  | "PAUSED"
  | "IN_REVIEW"
  | "WITH_ISSUES";

export type AdsAccountOption = {
  id: string;
  name: string;
  currency: "VND" | "USD";
  timezone: string;
  status: "ACTIVE" | "DISABLED";
};

export type AdsManagerEntity = {
  id: string;
  level: AdsEntityLevel;
  name: string;
  parentName?: string;
  status: AdsDeliveryStatus;
  objective: string;
  budget: number;
  spend: number;
  results: number;
  resultLabel: string;
  impressions: number;
  reach: number;
  ctr: number;
  roas: number;
  updatedAt: string;
};

export type AdsMetricSummary = {
  spend: number;
  results: number;
  costPerResult: number;
  revenue: number;
  roas: number;
  impressions: number;
};

export type AdsTableColumnId =
  | "objective"
  | "budget"
  | "spend"
  | "results"
  | "costPerResult"
  | "impressions"
  | "ctr"
  | "roas";

export type AdsManagerFilters = {
  status: "ALL" | AdsDeliveryStatus;
  objective: "ALL" | string;
  minimumRoas: number;
  onlyWithSpend: boolean;
};
