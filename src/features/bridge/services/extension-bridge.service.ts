import { BridgeOptions } from "../types";
import { handleClientStorageRequest } from "@/lib/client-storage/handlers";

const FALLBACK_EXTENSION_IDS = [
  "ghbmnnjooekpmoecnnnilnnbdlolhkhi",
  "nmmhkkegccagdldgiimedpiccmgmieda"
];
const DEFAULT_TIMEOUT_MS = 30000;

export class ExtensionBridgeService {
  private primaryExtensionId: string | null = null;

  /**
   * Check if running in Desktop Profile mode
   */
  isDesktopMode(): boolean {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("desktop_view") === "profile-resource" || !!(window as any).apiWeb;
  }

  /**
   * Get the active Bridge API (window.apiExtension or window.apiWeb or Chrome extension)
   */
  private getApi(): any {
    if (typeof window === "undefined") return null;
    if (this.isDesktopMode() && (window as any).apiWeb) {
      return (window as any).apiWeb;
    }
    return (window as any).apiExtension;
  }

  /**
   * Send a message on a channel asynchronously without waiting for a direct return value
   */
  async send<T = any>(channel: string, ...args: any[]): Promise<T> {
    const api = this.getApi();
    if (api?.send) {
      return api.send(channel, ...args);
    }
    
    // If window API not exposed, try communicating directly via chrome.runtime
    return this.invokeWithChromeRuntime(channel, args[0]);
  }

  /**
   * Invoke a method on a channel and wait for the response, with timeout handling
   */
  async invoke<T = any>(
    channel: string,
    payload?: any,
    options: BridgeOptions = {}
  ): Promise<T> {
    const api = this.getApi();
    const timeout = options.timeout || DEFAULT_TIMEOUT_MS;

    if (api?.invoke) {
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Bridge invoke timeout on channel '${channel}' after ${timeout}ms`));
        }, timeout);

        api.invoke(channel, payload)
          .then((result: T) => {
            clearTimeout(timer);
            resolve(result);
          })
          .catch((err: any) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    }

    // Fallback to direct chrome.runtime communication if available
    return this.invokeWithFallback(channel, payload, options);
  }

  /**
   * Invoke via chrome.runtime.sendMessage with ID fallback and retry
   */
  async invokeWithFallback<T>(
    channel: string,
    payload?: any,
    options: BridgeOptions = {}
  ): Promise<T> {
    const extensionIds = this.primaryExtensionId
      ? [this.primaryExtensionId, ...FALLBACK_EXTENSION_IDS.filter((id) => id !== this.primaryExtensionId)]
      : FALLBACK_EXTENSION_IDS;

    let lastError: Error | null = null;

    for (const extId of extensionIds) {
      try {
        const result = await this.invokeWithChromeRuntimeId<T>(extId, channel, payload, options.timeout);
        this.primaryExtensionId = extId; // Store successful extension ID
        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(`[ExtensionBridge] Connection failed for ID: ${extId}, trying next...`, err.message);
      }
    }

    const clientStorageResult = await handleClientStorageRequest(channel, payload).catch(() => undefined);
    if (clientStorageResult !== undefined) {
      return clientStorageResult as T;
    }

    throw lastError || new Error(`No real extension bridge response for channel '${channel}'.`);
  }

  /**
   * Directly call chrome.runtime.sendMessage with target Extension ID
   */
  private invokeWithChromeRuntimeId<T>(
    extensionId: string,
    channel: string,
    payload: any,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (typeof window === "undefined" || !(window as any).chrome?.runtime?.sendMessage) {
        return reject(new Error("chrome.runtime.sendMessage is not available."));
      }

      const timer = setTimeout(() => {
        reject(new Error(`Extension bridge timeout for ID ${extensionId} on channel '${channel}'`));
      }, timeoutMs);

      (window as any).chrome.runtime.sendMessage(
        extensionId,
        { channel, payload },
        (response: any) => {
          clearTimeout(timer);
          if ((window as any).chrome.runtime.lastError) {
            return reject(new Error((window as any).chrome.runtime.lastError.message));
          }
          if (response?.error) {
            return reject(new Error(response.error));
          }
          resolve(response?.data ?? response);
        }
      );
    });
  }

  /**
   * Invoke using general chrome.runtime.sendMessage (for content scripts calling background scripts)
   */
  private invokeWithChromeRuntime<T>(channel: string, payload: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (typeof window === "undefined" || !(window as any).chrome?.runtime?.sendMessage) {
        return reject(new Error("chrome.runtime is not available."));
      }

      (window as any).chrome.runtime.sendMessage({ channel, payload }, (response: any) => {
        if ((window as any).chrome.runtime.lastError) {
          return reject(new Error((window as any).chrome.runtime.lastError.message));
        }
        if (response?.error) {
          return reject(new Error(response.error));
        }
        resolve(response?.data ?? response);
      });
    });
  }

  /**
   * Return an explicit error when no real bridge is available.
   */
  private getUnavailableBridgeResponse<T>(channel: string, payload: unknown): T {
    console.log(`[ExtensionBridge unavailable] Channel: ${channel}`, payload);
    
    // Keep this as an error-only path. Real data must come from extension, desktop bridge, or IndexedDB.
    if (false && (channel === "facebook:get-session-info" || channel === "GET_FACEBOOK_SESSION_INFO")) {
      return {
        cookie: "",
        uid: "",
        name: "Võ Thế Công",
      } as any as T;
    }
    
    throw new Error(`No real extension bridge response for channel '${channel}'.`);
  }
}

export const extensionBridge = new ExtensionBridgeService();
