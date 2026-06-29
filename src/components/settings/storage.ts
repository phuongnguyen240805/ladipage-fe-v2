import { clientIndexedDb } from "@/lib/client-storage/indexed-db";
import type { FacebookAuthRecord } from "@/lib/client-storage/indexed-db";

type BrowserDbBridge = {
  send?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>;
  invoke?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>;
};

function getBrowserDbBridge(): BrowserDbBridge | null {
  if (typeof window === "undefined") return null;

  const bridgeWindow = window as Window & {
    apiExtension?: BrowserDbBridge;
    apiWeb?: BrowserDbBridge;
  };

  return bridgeWindow.apiExtension || bridgeWindow.apiWeb || null;
}

export async function readSettingValue(key: string) {
  if (typeof window === "undefined") return "";

  try {
    const indexedValue = await clientIndexedDb.getSetting<string>(key);
    if (typeof indexedValue === "string") return indexedValue;

    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

export async function saveSettingValue(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    await clientIndexedDb.setSetting(key, value);
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Không thể lưu cài đặt:", error);
  }
}

export async function readFacebookAuthRecord() {
  if (typeof window === "undefined") return undefined;

  const bridge = getBrowserDbBridge();
  if (bridge?.send) {
    const bridgeAuth = await bridge
      .send<FacebookAuthRecord | undefined>("db:get-facebook-auth", {})
      .catch(() => undefined);
    if (bridgeAuth) return bridgeAuth;
  }

  if (bridge?.invoke) {
    const bridgeAuth = await bridge
      .invoke<FacebookAuthRecord | undefined>("db:get-facebook-auth", {})
      .catch(() => undefined);
    if (bridgeAuth) return bridgeAuth;
  }

  return clientIndexedDb.getFacebookAuth().catch(() => undefined);
}
