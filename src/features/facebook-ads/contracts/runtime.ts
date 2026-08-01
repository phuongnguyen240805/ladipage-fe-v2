export type FacebookAdsSurface = "workspace" | "extension" | "dev-preview";

export type FacebookAdsScenarioId =
  | "happy"
  | "loading"
  | "empty"
  | "stale"
  | "disconnected"
  | "permission-denied"
  | "rate-limited"
  | "partial";

export type FacebookAdsConnectionStatus =
  | "connected"
  | "expired"
  | "disconnected"
  | "permission-required";

export type FacebookAdsDataState =
  | "ready"
  | "loading"
  | "empty"
  | "stale"
  | "blocked"
  | "partial";

export type FacebookAdsDataProvenance = {
  source: "fixture" | "backend" | "extension";
  label: string;
  observedAt: string;
  staleAt?: string;
};

export type FacebookAdsRuntime = {
  surface: FacebookAdsSurface;
  scenario: FacebookAdsScenarioId;
  connectionStatus: FacebookAdsConnectionStatus;
  dataState: FacebookAdsDataState;
  canPublish: boolean;
  provenance: FacebookAdsDataProvenance;
};

