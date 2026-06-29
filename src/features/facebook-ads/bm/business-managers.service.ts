import type { BusinessManager } from "@/features/facebook-ads/components/tai-khoan-bm/types";
import { facebookAuthService } from "@/features/auth/services/facebook-auth.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { clientIndexedDb } from "@/lib/client-storage/indexed-db";
import { facebookApiClient } from "@/lib/facebook/facebook-api.client";
import type { BusinessManagerRow, LoadBusinessManagersOptions } from "./types";

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

function countList(value: unknown, explicitCount?: unknown) {
  const numericCount = Number(explicitCount);
  if (Number.isFinite(numericCount) && numericCount >= 0) return numericCount;
  if (Array.isArray(value)) return value.length;

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 0;

    try {
      const parsedValue = JSON.parse(trimmedValue);
      if (Array.isArray(parsedValue)) return parsedValue.length;
      if (parsedValue && typeof parsedValue === "object" && Array.isArray(parsedValue.items)) return parsedValue.items.length;
      if (parsedValue && typeof parsedValue === "object" && typeof parsedValue.count === "number") return parsedValue.count;
    } catch {
      return 0;
    }
  }

  if (value && typeof value === "object" && "count" in value) {
    const objectCount = Number((value as { count?: unknown }).count);
    if (Number.isFinite(objectCount) && objectCount >= 0) return objectCount;
  }

  return 0;
}

function formatLimit(row: BusinessManagerRow) {
  const rawLimit = row.limit ?? row.adtrust_dsl;
  if (rawLimit === null || rawLimit === undefined || rawLimit === "") return "-";

  const numericLimit = Number(rawLimit);
  if (!Number.isFinite(numericLimit)) return text(rawLimit) || "-";
  if (numericLimit <= 0) return "-";

  return new Intl.NumberFormat("vi-VN").format(numericLimit);
}

function mapStatus(row: BusinessManagerRow): BusinessManager["status"] {
  const rawStatus = row.status ?? row.statusLabel ?? row.account_status;
  const normalizedStatus = text(rawStatus).toUpperCase();

  if (rawStatus === 1 || normalizedStatus === "1" || normalizedStatus === "LIVE" || normalizedStatus === "ACTIVE") {
    return "ACTIVE";
  }

  if (
    rawStatus === 2 ||
    normalizedStatus === "2" ||
    normalizedStatus.includes("DIE") ||
    normalizedStatus.includes("DISABLED") ||
    normalizedStatus.includes("RESTRICTED")
  ) {
    return "DISABLED";
  }

  return "PENDING_REVIEW";
}

function normalizeBmId(row: BusinessManagerRow) {
  return text(row.bmId || row.businessId || row.business_id || row.id);
}

export function mapBusinessManagerRow(row: BusinessManagerRow): BusinessManager {
  const bmId = normalizeBmId(row);

  return {
    id: text(row.id || bmId),
    name: text(row.name) || bmId || "Business Manager",
    bmId,
    status: mapStatus(row),
    limit: formatLimit(row),
    pagesCount: countList(row.pages || row.page, row.pagesCount ?? row.pageCount),
    partnersCount: countList(row.partners || row.partner, row.partnersCount ?? row.partnerCount),
    adminsCount: countList(row.admins || row.admin, row.adminsCount ?? row.adminCount),
    instagramCount: countList(row.instagram, row.instagramCount),
    whatsappCount: countList(row.whatsapp, row.whatsappCount),
    paymentMethod: text(row.paymentMethodSummary || row.paymentMethod) || "-",
  };
}

async function resolveActiveUid() {
  const storeUid = useAuthStore.getState().uid;
  if (storeUid) return storeUid;

  const auth = await clientIndexedDb.getFacebookAuth().catch(() => undefined);
  return text(auth?.uid);
}

export const businessManagersService = {
  async getCachedRows(uid?: string): Promise<BusinessManagerRow[]> {
    const activeUid = uid || (await resolveActiveUid());
    if (!activeUid) return [];

    const bridge = getBrowserBridgeApi();
    if (bridge?.send) {
      const rows = await bridge.send<BusinessManagerRow[]>("db:get-bm-accounts", activeUid).catch(() => undefined);
      if (Array.isArray(rows)) return rows;
    }

    return clientIndexedDb.getResourceRows<BusinessManagerRow>("bm", activeUid);
  },

  async getCachedManagers(uid?: string): Promise<BusinessManager[]> {
    const rows = await this.getCachedRows(uid);
    return rows.map(mapBusinessManagerRow);
  },

  async refreshManagers(options: LoadBusinessManagersOptions): Promise<BusinessManager[]> {
    const activeUid = await resolveActiveUid();
    if (!activeUid) throw new Error("Không xác định được tài khoản Facebook hiện tại.");

    await facebookAuthService.refreshFullTokens();
    const response = await facebookApiClient.getMyBusinesses();
    const rows = Array.isArray(response?.data) ? (response.data as BusinessManagerRow[]) : [];
    const limitedRows = rows.slice(0, Math.max(1, options.limit || 50));

    await clientIndexedDb.saveResourceRows("bm", activeUid, limitedRows);

    const bridge = getBrowserBridgeApi();
    if (bridge?.send) {
      await bridge
        .send("db:save-bm-list", {
          uid: activeUid,
          rows: limitedRows,
        })
        .catch(() => undefined);
    }

    return limitedRows.map(mapBusinessManagerRow);
  },
};
