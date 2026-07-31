import type { AdsAccount } from "@/features/facebook-ads/components/tai-khoan-qc/types";
import { facebookAuthService } from "@/features/auth/services/facebook-auth.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { clientIndexedDb } from "@/lib/client-storage/indexed-db";
import { facebookApiClient } from "@/lib/facebook/facebook-api.client";
import type { AdsAccountRow, LoadAdsAccountsOptions } from "./types";

type BrowserBridgeApi = {
  send?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>;
  invoke?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>;
};

function getBrowserBridgeApi(): BrowserBridgeApi | null {
  if (typeof window === "undefined") return null;

  const bridgeWindow = window as Window & {
    apiExtension?: BrowserBridgeApi;
    apiWeb?: BrowserBridgeApi;
  };

  return bridgeWindow.apiWeb || bridgeWindow.apiExtension || null;
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeAdAccountId(row: AdsAccountRow) {
  const rawId = text(row.accountId || row.adId || row.id);
  return rawId.replace(/^act_/i, "") || rawId;
}

function formatMoney(value: unknown, currency?: string) {
  const normalizedCurrency = text(currency) || "USD";
  if (value === null || value === undefined || value === "") return "-";

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return text(value) || "-";

  return `${new Intl.NumberFormat("vi-VN").format(numberValue)} ${normalizedCurrency}`;
}

function mapStatus(row: AdsAccountRow): AdsAccount["status"] {
  const status = row.status ?? row.accountStatus ?? row.account_status;
  const normalizedStatus = text(status).toUpperCase();

  if (status === 1 || normalizedStatus === "1" || normalizedStatus === "ACTIVE") return "ACTIVE";
  if (status === 2 || normalizedStatus === "2" || normalizedStatus === "DISABLED") return "DISABLED";
  return "PENDING_REVIEW";
}

function mapType(row: AdsAccountRow): AdsAccount["type"] {
  const type = text(row.type).toUpperCase();
  if (type === "BM" || row.bmId || row.businessId) return "BM";
  return "PERSONAL";
}

function mapRole(row: AdsAccountRow) {
  return text(row.role || row.accountRole || row.userRole) || "Không rõ";
}

function mapPaymentMethod(row: AdsAccountRow) {
  return text(row.paymentMethodSummary || row.paymentMethod) || "-";
}

export function mapAdsAccountRow(row: AdsAccountRow): AdsAccount {
  const accountId = normalizeAdAccountId(row);
  const currency = text(row.currencyCode || row.currency) || "USD";

  return {
    id: text(row.id || row.accountId || row.adId || accountId),
    name: text(row.accountName || row.name) || accountId || "Tài khoản quảng cáo",
    uid: accountId,
    status: mapStatus(row),
    type: mapType(row),
    balance: formatMoney(row.balance, currency),
    threshold: formatMoney(row.threshold || row.thresholdAmount, currency),
    limit: formatMoney(row.adLimit || row.limit, currency),
    currency,
    role: mapRole(row),
    paymentMethod: mapPaymentMethod(row),
  };
}

async function resolveActiveUid() {
  const storeUid = useAuthStore.getState().facebook.uid;
  if (storeUid) return storeUid;

  const auth = await clientIndexedDb.getFacebookAuth().catch(() => undefined);
  return text(auth?.uid);
}

export const adsAccountsService = {
  async getCachedRows(uid?: string): Promise<AdsAccountRow[]> {
    const activeUid = uid || (await resolveActiveUid());
    if (!activeUid) return [];

    const bridge = getBrowserBridgeApi();
    if (bridge?.send) {
      const rows = await bridge.send<AdsAccountRow[]>("db:get-ads-accounts", { uid: activeUid }).catch(() => undefined);
      if (Array.isArray(rows)) return rows;
    }

    return clientIndexedDb.getResourceRows<AdsAccountRow>("ads", activeUid);
  },

  async getCachedAccounts(uid?: string): Promise<AdsAccount[]> {
    const rows = await this.getCachedRows(uid);
    return rows.map(mapAdsAccountRow);
  },

  async refreshAccounts(options: LoadAdsAccountsOptions): Promise<AdsAccount[]> {
    const activeUid = await resolveActiveUid();
    if (!activeUid) throw new Error("Không xác định được tài khoản Facebook hiện tại.");

    await facebookAuthService.refreshFullTokens();
    const response = await facebookApiClient.getAdAccounts();
    const rows = Array.isArray(response?.data) ? (response.data as AdsAccountRow[]) : [];

    const limitedRows = rows.slice(0, Math.max(1, options.limit || 500));
    await clientIndexedDb.saveResourceRows("ads", activeUid, limitedRows);

    const bridge = getBrowserBridgeApi();
    if (bridge?.send) {
      await bridge
        .send("db:save-ads-list", {
          uid: activeUid,
          rows: limitedRows,
        })
        .catch(() => undefined);
    }

    return limitedRows.map(mapAdsAccountRow);
  },
};
