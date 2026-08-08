import { apiDelete, apiGet, apiPost } from "@/lib/api-client";

import type {
  AdsAccount,
  AdsConnection,
  AdsExtensionSession,
  AdsJob,
  AdsProvider,
  AdsProviderManifest,
  CreateAdsPublishJobInput,
  CreateAdsSyncJobInput,
} from "../contracts";

const BASE_PATH = "/ads-platform";

export const adsPlatformRepository = {
  listProviders: () => apiGet<AdsProviderManifest[]>(`${BASE_PATH}/providers`),

  listConnections: () => apiGet<AdsConnection[]>(`${BASE_PATH}/connections`),

  startOAuth: (provider: AdsProvider, returnTo?: string) =>
    apiPost<{ provider: AdsProvider; url: string; expiresInSeconds: number }>(
      `${BASE_PATH}/connections/${provider.toLowerCase()}/oauth/start`,
      returnTo ? { returnTo } : {},
    ),

  disconnect: (connectionId: string) =>
    apiDelete<{ disconnected: true }>(
      `${BASE_PATH}/connections/${encodeURIComponent(connectionId)}`,
    ),

  discoverAccounts: (connectionId: string) =>
    apiPost<AdsAccount[]>(
      `${BASE_PATH}/connections/${encodeURIComponent(connectionId)}/discover-accounts`,
    ),

  listAccounts: (connectionId?: string) => {
    const query = connectionId
      ? `?connectionId=${encodeURIComponent(connectionId)}`
      : "";
    return apiGet<AdsAccount[]>(`${BASE_PATH}/accounts${query}`);
  },

  createSyncJob: (input: CreateAdsSyncJobInput) =>
    apiPost<AdsJob>(`${BASE_PATH}/jobs/sync`, input),

  createPublishJob: (input: CreateAdsPublishJobInput) =>
    apiPost<AdsJob>(`${BASE_PATH}/jobs/publish`, input),

  getJob: (jobId: string) =>
    apiGet<AdsJob>(`${BASE_PATH}/jobs/${encodeURIComponent(jobId)}`),

  createExtensionSession: (deviceId: string) =>
    apiPost<AdsExtensionSession>(`${BASE_PATH}/extension/sessions`, { deviceId }),
};
