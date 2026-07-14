/**
 * Plan B — Cloudflare for SaaS Custom Hostnames client.
 * When credentials missing, create returns a local pending id (dev) and get/delete no-op safely.
 */

import {
  getCustomDomainCnameTarget,
  mapCloudflareHostnameToDomainStatus,
  mapCloudflareSslToStatus,
  type DomainSslStatus,
  type DomainVerifyStatus,
} from "./domain-hostname.util";

export interface CloudflareSaasConfig {
  accountId: string | null;
  apiToken: string | null;
  /** Optional zone for SSL for SaaS; custom hostnames are account-scoped. */
  zoneId: string | null;
}

export interface CustomHostnameRecord {
  id: string;
  hostname: string;
  status: string;
  sslStatus: string | null;
  domainStatus: DomainVerifyStatus;
  mappedSslStatus: DomainSslStatus;
  verificationErrors: unknown[];
  raw?: unknown;
}

export function getCloudflareSaasConfig(): CloudflareSaasConfig {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || null,
    apiToken: process.env.CLOUDFLARE_API_TOKEN?.trim() || null,
    zoneId: process.env.CLOUDFLARE_ZONE_ID?.trim() || null,
  };
}

export function isCloudflareSaasConfigured(
  config: CloudflareSaasConfig = getCloudflareSaasConfig(),
): boolean {
  return Boolean(config.accountId && config.apiToken);
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function parseCustomHostnamePayload(result: Record<string, unknown>): CustomHostnameRecord {
  const ssl = (result.ssl ?? {}) as Record<string, unknown>;
  const sslStatus = typeof ssl.status === "string" ? ssl.status : null;
  const status = typeof result.status === "string" ? result.status : "pending";
  const verificationErrors = Array.isArray(result.verification_errors)
    ? result.verification_errors
    : Array.isArray(ssl.validation_errors)
      ? ssl.validation_errors
      : [];

  return {
    id: String(result.id ?? ""),
    hostname: String(result.hostname ?? ""),
    status,
    sslStatus,
    domainStatus: mapCloudflareHostnameToDomainStatus({
      hostnameStatus: status,
      sslStatus,
    }),
    mappedSslStatus: mapCloudflareSslToStatus(sslStatus),
    verificationErrors,
    raw: result,
  };
}

/**
 * Create Custom Hostname. Without API credentials → synthetic pending id for local/dev.
 */
export async function createCustomHostname(
  hostname: string,
  config: CloudflareSaasConfig = getCloudflareSaasConfig(),
): Promise<CustomHostnameRecord> {
  if (!isCloudflareSaasConfigured(config)) {
    return {
      id: `local-pending-${hostname.replace(/[^a-z0-9.-]/g, "-")}`,
      hostname,
      status: "pending",
      sslStatus: "pending_validation",
      domainStatus: "PENDING",
      mappedSslStatus: "PENDING",
      verificationErrors: [],
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/custom_hostnames`;
  const body = {
    hostname,
    ssl: {
      method: "http",
      type: "dv",
      settings: {
        http2: "on",
        min_tls_version: "1.2",
        tls_1_3: "on",
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(config.apiToken!),
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    success?: boolean;
    result?: Record<string, unknown>;
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || !json.success || !json.result) {
    const msg =
      json.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
      `Cloudflare create custom hostname failed (${res.status})`;
    throw Object.assign(new Error(msg), { status: 502 });
  }

  return parseCustomHostnamePayload(json.result);
}

export async function getCustomHostname(
  customHostnameId: string,
  config: CloudflareSaasConfig = getCloudflareSaasConfig(),
): Promise<CustomHostnameRecord | null> {
  if (!customHostnameId) return null;

  if (!isCloudflareSaasConfigured(config) || customHostnameId.startsWith("local-pending-")) {
    return {
      id: customHostnameId,
      hostname: "",
      status: "pending",
      sslStatus: "pending_validation",
      domainStatus: "PENDING",
      mappedSslStatus: "PENDING",
      verificationErrors: [
        {
          message: `Point CNAME to ${getCustomDomainCnameTarget()} then configure CLOUDFLARE_* credentials for live verification.`,
        },
      ],
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/custom_hostnames/${encodeURIComponent(customHostnameId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(config.apiToken!),
  });

  if (res.status === 404) return null;

  const json = (await res.json()) as {
    success?: boolean;
    result?: Record<string, unknown>;
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || !json.success || !json.result) {
    const msg =
      json.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
      `Cloudflare get custom hostname failed (${res.status})`;
    throw Object.assign(new Error(msg), { status: 502 });
  }

  return parseCustomHostnamePayload(json.result);
}

export async function deleteCustomHostname(
  customHostnameId: string,
  config: CloudflareSaasConfig = getCloudflareSaasConfig(),
): Promise<{ deleted: boolean; message: string }> {
  if (!customHostnameId) {
    return { deleted: false, message: "No cloudflare_hostname_id" };
  }

  if (!isCloudflareSaasConfigured(config) || customHostnameId.startsWith("local-pending-")) {
    return { deleted: true, message: "Local/dev hostname cleared (no CF API call)" };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/custom_hostnames/${encodeURIComponent(customHostnameId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(config.apiToken!),
  });

  if (res.status === 404) {
    return { deleted: true, message: "Already absent on Cloudflare" };
  }

  const json = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || !json.success) {
    const msg =
      json.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
      `Cloudflare delete failed (${res.status})`;
    throw Object.assign(new Error(msg), { status: 502 });
  }

  return { deleted: true, message: "Deleted on Cloudflare" };
}

/** KV put for edge route map (Workers KV REST). */
export async function putLandingRouteKv(
  key: string,
  value: Record<string, unknown>,
  config: {
    accountId: string | null;
    apiToken: string | null;
    kvNamespaceId: string | null;
  },
): Promise<{ ok: boolean; message: string }> {
  if (!config.accountId || !config.apiToken || !config.kvNamespaceId) {
    return {
      ok: false,
      message: "KV credentials incomplete — route left pending",
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.kvNamespaceId}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    return { ok: false, message: `KV put failed (${res.status})` };
  }
  return { ok: true, message: `KV put ${key}` };
}

export async function deleteLandingRouteKv(
  key: string,
  config: {
    accountId: string | null;
    apiToken: string | null;
    kvNamespaceId: string | null;
  },
): Promise<{ ok: boolean; message: string }> {
  if (!config.accountId || !config.apiToken || !config.kvNamespaceId) {
    return { ok: false, message: "KV credentials incomplete" };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.kvNamespaceId}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.apiToken}` },
  });

  if (res.status === 404) return { ok: true, message: "KV key absent" };
  if (!res.ok) return { ok: false, message: `KV delete failed (${res.status})` };
  return { ok: true, message: `KV deleted ${key}` };
}
