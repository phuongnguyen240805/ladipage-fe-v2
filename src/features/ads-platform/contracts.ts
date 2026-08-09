export const ADS_PROVIDERS = ["META", "TIKTOK", "SHOPEE"] as const;

export type AdsProvider = (typeof ADS_PROVIDERS)[number];
export type AdsOperationState =
  | "CREATED"
  | "AUTHORIZED"
  | "VALIDATING"
  | "QUEUED"
  | "RUNNING"
  | "RECONCILING"
  | "SUCCEEDED"
  | "PARTIAL"
  | "FAILED"
  | "CANCELLED";

export interface AdsProviderManifest {
  provider: AdsProvider;
  version: string;
  canonicalSource: "OFFICIAL_API" | "PARTNER_API" | "BROWSER_OBSERVED";
  capabilities: string[];
}

export interface AdsConnection {
  id: string;
  provider: AdsProvider;
  externalUserId: string;
  displayName: string | null;
  status: "CONNECTED" | "EXPIRED" | "REAUTHORIZATION_REQUIRED" | "DISCONNECTED";
  scopes: string[];
  tokenExpiresAt: string | null;
  lastSyncedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AdsAccount {
  id: string;
  connectionId: string;
  provider: AdsProvider;
  externalId: string;
  name: string;
  currency: string | null;
  timezone: string | null;
  status: string | null;
  metadata: Record<string, unknown>;
}

export interface AdsJob {
  id: string;
  provider: AdsProvider;
  type: "SYNC" | "PUBLISH" | "ACTION" | "RECONCILE";
  state: AdsOperationState;
  idempotencyKey: string;
  connectionId: string | null;
  externalAccountId: string | null;
  checkpoint: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateAdsSyncJobInput {
  provider: AdsProvider;
  connectionId: string;
  externalAccountId: string;
  resource: "CAMPAIGNS" | "PERFORMANCE";
  since?: string;
  until?: string;
  idempotencyKey: string;
}

export interface CreateAdsPublishJobInput {
  provider: AdsProvider;
  connectionId: string;
  externalAccountId: string;
  idempotencyKey: string;
  revision: number;
  draft: Record<string, unknown>;
}

export interface AdsExtensionSession {
  sessionId: string;
  accessToken: string;
  expiresAt: string;
}

export interface AdsSnapshot {
  id: string;
  provider: AdsProvider;
  source: "OFFICIAL_API" | "PARTNER_API" | "BROWSER_EXTENSION" | "DEV_FIXTURE";
  confidence: "AUTHORITATIVE" | "SUPPLEMENTAL" | "DIAGNOSTIC";
  externalAccountId: string;
  schemaVersion: number;
  observedAt: string;
  staleAt: string | null;
  payload: Record<string, unknown>;
}
