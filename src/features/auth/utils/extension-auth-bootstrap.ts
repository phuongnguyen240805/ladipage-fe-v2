import { backendSessionService } from "../services/backend-session.service";
import { useAuthStore } from "../stores/auth.store";
import type { AuthState } from "../types";

const EXTENSION_AUTH_REQUEST = "ladipage-auth-bootstrap-request";
const EXTENSION_AUTH_RESPONSE = "ladipage-auth-bootstrap-response";
const EXTENSION_AUTH_TIMEOUT_MS = 5_000;

type ExtensionAuthSnapshot = {
  token: string;
  facebook?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The existing extension protocol still supplies a legacy Nest access token.
 * Accept only the minimum fields required to bridge that token into the web
 * app's HttpOnly cookie session; never persist the token in browser storage.
 */
export function normalizeExtensionAuthSnapshot(
  value: unknown,
): ExtensionAuthSnapshot | null {
  if (!isRecord(value) || !isRecord(value.state)) return null;
  const platform = value.state.platform;
  if (!isRecord(platform)) return null;

  const token = platform.nestToken;
  if (typeof token !== "string" || token.trim().length === 0) return null;

  return {
    token: token.trim(),
    ...(isRecord(value.state.facebook)
      ? { facebook: value.state.facebook }
      : {}),
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

function applyExtensionFacebookSnapshot(
  facebook: Record<string, unknown> | undefined,
): void {
  if (!facebook) return;
  useAuthStore
    .getState()
    .setFacebookContext(facebook as Partial<AuthState["facebook"]>);
}

/**
 * Bridges the extension's legacy bearer token into the server-owned web
 * session. The token is sent once to a same-origin endpoint for validation and
 * conversion to HttpOnly cookie state, then discarded by browser code.
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

      void backendSessionService
        .bridgeLegacyAccessToken(snapshot.token)
        .then(() => {
          applyExtensionFacebookSnapshot(snapshot.facebook);
          finish(true);
        })
        .catch(() => finish(false));
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
