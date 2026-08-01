import { AUTH_STORE_KEY } from "../constants";

const EXTENSION_AUTH_REQUEST = "ladipage-auth-bootstrap-request";
const EXTENSION_AUTH_RESPONSE = "ladipage-auth-bootstrap-response";
const EXTENSION_AUTH_TIMEOUT_MS = 5_000;

type PersistedAuthSnapshot = {
  version: number;
  state: {
    platform: Record<string, unknown> & { nestToken: string };
    platformStatus: string;
    facebook?: Record<string, unknown>;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeExtensionAuthSnapshot(
  value: unknown,
): PersistedAuthSnapshot | null {
  if (!isRecord(value) || !isRecord(value.state)) return null;
  const platform = value.state.platform;
  if (!isRecord(platform)) return null;

  const nestToken = platform.nestToken;
  if (typeof nestToken !== "string" || nestToken.trim().length === 0) {
    return null;
  }

  return {
    version: typeof value.version === "number" ? value.version : 0,
    state: {
      platform: { ...platform, nestToken },
      platformStatus:
        value.state.platformStatus === "authenticated"
          ? "authenticated"
          : "loading",
      ...(isRecord(value.state.facebook)
        ? { facebook: value.state.facebook }
        : {}),
    },
  };
}

function isExtensionFacebookAdsFrame(): boolean {
  if (typeof window === "undefined" || window.self === window.top) return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("embedded") === "1" &&
    params.get("source") === "extensionpromax"
  );
}

/**
 * Restores the authenticated web session inside the extension's partitioned
 * iframe storage. The request contains no credentials; the response is only
 * accepted from the direct chrome-extension parent frame.
 */
export async function bootstrapAuthFromExtension(): Promise<boolean> {
  if (!isExtensionFacebookAdsFrame()) return false;

  const requestId = crypto.randomUUID();

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      resolve(result);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (!event.origin.startsWith("chrome-extension://")) return;
      if (
        event.data?.source !== "extensionpromax" ||
        event.data?.type !== EXTENSION_AUTH_RESPONSE ||
        event.data?.requestId !== requestId
      ) {
        return;
      }

      const snapshot = normalizeExtensionAuthSnapshot(event.data.snapshot);
      if (!snapshot) {
        finish(false);
        return;
      }

      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(snapshot));
      finish(true);
    };

    const timeoutId = window.setTimeout(
      () => finish(false),
      EXTENSION_AUTH_TIMEOUT_MS,
    );
    window.addEventListener("message", onMessage);
    window.parent.postMessage(
      {
        source: "ladipage-fe",
        type: EXTENSION_AUTH_REQUEST,
        requestId,
      },
      "*",
    );
  });
}
