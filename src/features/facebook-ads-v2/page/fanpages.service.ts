import type { FanpageItem } from "@/features/facebook-ads/components/fanpage/types";
import { facebookAuthService } from "@/features/auth/services/facebook-auth.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { clientIndexedDb } from "@/lib/client-storage/indexed-db";
import { facebookApiClient } from "@/lib/facebook/facebook-api.client";
import type { FanpageRow, LoadFanpagesOptions } from "./types";

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

function numberText(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return text(value) || "0";
  return new Intl.NumberFormat("vi-VN").format(numericValue);
}

function mapStatus(row: FanpageRow): FanpageItem["status"] {
  const rawStatus = row.status ?? row.statusLabel;
  const normalizedStatus = text(rawStatus).toUpperCase();

  if (normalizedStatus === "ACTIVE" || normalizedStatus === "ACTIVE" || normalizedStatus === "LIVE" || normalizedStatus === "4") {
    return "ACTIVE";
  }

  if (
    normalizedStatus === "DEACTIVE" ||
    normalizedStatus === "DISABLED" ||
    normalizedStatus === "1" ||
    normalizedStatus.includes("DIE") ||
    normalizedStatus.includes("HẠN")
  ) {
    return "DISABLED";
  }

  return "PENDING_REVIEW";
}

function mapVerification(value: unknown): FanpageItem["verification"] {
  const normalizedValue = text(value).toUpperCase();
  if (normalizedValue.includes("BLUE") || normalizedValue.includes("XANH")) return "BLUE";
  if (normalizedValue.includes("GRAY") || normalizedValue.includes("XÁM") || normalizedValue.includes("XAM")) return "GRAY";
  return "NONE";
}

function mapMonetization(row: FanpageRow) {
  return text(row.monetization || row.brandedContent) || "Chưa có dữ liệu";
}

function mapDistribution(row: FanpageRow) {
  return text(row.distribution || row.pageLive) || "-";
}

export function mapFanpageRow(row: FanpageRow): FanpageItem {
  const pageId = text(row.pageId || row.page_id || row.id);

  return {
    id: text(row.id || pageId),
    name: text(row.name) || pageId || "Fanpage",
    pageId,
    status: mapStatus(row),
    followers: numberText(row.followers ?? row.followers_count ?? row.likes),
    postsCount: Number(row.postsCount ?? row.postCount) || 0,
    verification: mapVerification(row.verification),
    distribution: mapDistribution(row),
    monetization: mapMonetization(row),
  };
}

async function resolveActiveUid() {
  const storeUid = useAuthStore.getState().facebook.uid;
  if (storeUid) return storeUid;

  const auth = await clientIndexedDb.getFacebookAuth().catch(() => undefined);
  return text(auth?.uid);
}

export const fanpagesService = {
  async getCachedRows(uid?: string): Promise<FanpageRow[]> {
    const activeUid = uid || (await resolveActiveUid());
    if (!activeUid) return [];

    const bridge = getBrowserBridgeApi();
    if (bridge?.send) {
      const rows = await bridge.send<FanpageRow[]>("db:get-page-accounts", activeUid).catch(() => undefined);
      if (Array.isArray(rows)) return rows;
    }

    return clientIndexedDb.getResourceRows<FanpageRow>("page", activeUid);
  },

  async getCachedPages(uid?: string): Promise<FanpageItem[]> {
    const rows = await this.getCachedRows(uid);
    return rows.map(mapFanpageRow);
  },

  async refreshPages(options: LoadFanpagesOptions): Promise<FanpageItem[]> {
    const activeUid = await resolveActiveUid();
    if (!activeUid) throw new Error("Không xác định được tài khoản Facebook hiện tại.");

    await facebookAuthService.refreshFullTokens();
    const response = await facebookApiClient.getMyPages();
    const rows = Array.isArray(response?.data) ? (response.data as FanpageRow[]) : [];
    const limitedRows = rows.slice(0, Math.max(1, options.limit || 100));

    await clientIndexedDb.saveResourceRows("page", activeUid, limitedRows);

    const bridge = getBrowserBridgeApi();
    if (bridge?.send) {
      await bridge
        .send("db:save-page-list", {
          uid: activeUid,
          rows: limitedRows,
        })
        .catch(() => undefined);
    }

    return limitedRows.map(mapFanpageRow);
  },
};
