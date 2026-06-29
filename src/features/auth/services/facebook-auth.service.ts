import { useAuthStore } from "../stores/auth.store";
import { tokenManager } from "./token-manager";
import { FacebookTokenSet, FacebookUserProfile, CheckpointState } from "../types";
import { extensionBridge } from "@/features/bridge/services/extension-bridge.service";
import { clientIndexedDb, type FacebookAuthRecord } from "@/lib/client-storage/indexed-db";

type FacebookSessionInfo = {
  cookie?: string;
  uid?: string;
  name?: string;
};

type BrowserBridgeApi = {
  invoke?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>;
  send?: <T = unknown>(channel: string, payload?: unknown) => Promise<T>;
  getFacebookSessionInfo?: (payload?: unknown) => Promise<FacebookSessionInfo>;
};

function getBrowserBridgeApi(): BrowserBridgeApi | null {
  if (typeof window === "undefined") return null;

  const bridgeWindow = window as Window & {
    apiExtension?: BrowserBridgeApi;
    apiWeb?: BrowserBridgeApi;
  };

  return bridgeWindow.apiExtension || bridgeWindow.apiWeb || null;
}

function sanitizeAuthToken(value?: string) {
  const token = String(value || "").trim();
  return token.includes("_MOCK_") ? "" : token;
}

function sanitizeAuthCookie(value?: string) {
  const cookie = String(value || "").trim();
  return cookie.includes("mock_session") || cookie.includes("xs=mock_") ? "" : cookie;
}

async function getFacebookSessionInfo(): Promise<FacebookSessionInfo | null> {
  const browserBridgeApi = getBrowserBridgeApi();

  if (browserBridgeApi?.getFacebookSessionInfo) {
    return browserBridgeApi.getFacebookSessionInfo({});
  }

  if (browserBridgeApi?.invoke) {
    const sessionInfo = await browserBridgeApi
      .invoke<FacebookSessionInfo>("facebook:get-session-info", {})
      .catch(() => null);

    if (sessionInfo?.cookie) return sessionInfo;
  }

  const extensionSessionInfo = await extensionBridge
    .invokeWithFallback<FacebookSessionInfo>("GET_FACEBOOK_SESSION_INFO", {}, { timeout: 10000 })
    .catch(() => null);

  if (extensionSessionInfo?.cookie) return extensionSessionInfo;

  return extensionBridge
    .invokeWithFallback<FacebookSessionInfo>("facebook:get-session-info", {}, { timeout: 10000 })
    .catch(() => null);
}

export class FacebookAuthService {
  private authRecordToTokenSet(auth?: FacebookAuthRecord | null): FacebookTokenSet {
    if (!auth) return {};

    return {
      eaag: sanitizeAuthToken(auth.accessToken || auth.token),
      eaab: sanitizeAuthToken(auth.accessToken2),
      eaai: sanitizeAuthToken(auth.accessToken4),
      eaah: sanitizeAuthToken(auth.accessToken5),
    };
  }

  private async getStoredFacebookAuth(): Promise<FacebookAuthRecord | undefined> {
    const browserBridgeApi = getBrowserBridgeApi();

    if (browserBridgeApi?.send) {
      const bridgeAuth = await browserBridgeApi
        .send<FacebookAuthRecord>("db:get-facebook-auth", {})
        .catch(() => undefined);
      if (bridgeAuth) return bridgeAuth;
    }

    return clientIndexedDb.getFacebookAuth().catch(() => undefined);
  }

  private async saveStoredFacebookAuth(auth: Omit<FacebookAuthRecord, "id" | "updatedAt">) {
    const browserBridgeApi = getBrowserBridgeApi();

    if (browserBridgeApi?.send) {
      await browserBridgeApi.send("db:save-facebook-auth", auth).catch(() => undefined);
    }

    await clientIndexedDb.saveFacebookAuth(auth).catch(() => undefined);
  }

  /**
   * Get the active Facebook UID from the store
   */
  getActiveUid(): string | null {
    return useAuthStore.getState().facebook.uid;
  }

  /**
   * Resolve auth context for a given UID and requirements
   */
  async resolveAuthContext(
    uid: string | null,
    requirements?: { requireTokens?: (keyof FacebookTokenSet)[] }
  ): Promise<{
    uid: string | null;
    profile: FacebookUserProfile | null;
    status: CheckpointState;
    error?: string;
  }> {
    const store = useAuthStore.getState();
    const currentUid = uid || store.facebook.uid;

    if (!currentUid) {
      return {
        uid: null,
        profile: null,
        status: "not_login",
        error: "No active user session found.",
      };
    }

    const profile = store.facebook.profile;
    if (!profile || profile.uid !== currentUid) {
      return {
        uid: currentUid,
        profile: null,
        status: "not_login",
        error: "Profile mismatch or session not active.",
      };
    }

    // Verify required tokens
    if (requirements?.requireTokens) {
      const tokenSet = profile.tokenSet || {};
      const missingTokens = requirements.requireTokens.filter((t) => !tokenSet[t]);
      if (missingTokens.length > 0) {
        return {
          uid: currentUid,
          profile,
          status: "not_login",
          error: `Missing required tokens: ${missingTokens.join(", ")}`,
        };
      }
    }

    return {
      uid: currentUid,
      profile,
      status: store.facebook.status,
      error: store.facebook.error,
    };
  }

  /**
   * Ensure that we have a live access token for a specific action.
   * If token is missing or expired, attempt to refresh.
   */
  async ensureLiveAccessTokenForAction(
    actionName: string,
    tokenType: keyof FacebookTokenSet = "eaag"
  ): Promise<string> {
    const store = useAuthStore.getState();
    const profile = store.facebook.profile;
    const token = profile?.tokenSet?.[tokenType];

    if (!token) {
      console.log(`[AuthService] No token found for action: ${actionName}, trying to refresh...`);
      await this.refreshFullTokens();
      const refreshedProfile = useAuthStore.getState().facebook.profile;
      const refreshedToken = refreshedProfile?.tokenSet?.[tokenType];
      if (!refreshedToken) {
        throw new Error(`Facebook access token (${tokenType.toUpperCase()}) unavailable for action: ${actionName}`);
      }
      return refreshedToken;
    }

    // Optional: Validate token lifetime/liveness via bridge or a local token shape check.
    const isLive = await this.validateTokenLiveness(token);
    if (!isLive) {
      console.log(`[AuthService] Token expired/invalid for action: ${actionName}, refreshing...`);
      await this.refreshFullTokens();
      const refreshedProfile = useAuthStore.getState().facebook.profile;
      const refreshedToken = refreshedProfile?.tokenSet?.[tokenType];
      if (!refreshedToken) {
        throw new Error(`Facebook access token (${tokenType.toUpperCase()}) expired and refresh failed.`);
      }
      return refreshedToken;
    }

    return token;
  }

  /**
   * Validate token liveness by sending a lightweight check request to Facebook Graph API
   */
  private async validateTokenLiveness(token: string): Promise<boolean> {
    try {
      // In a real environment, we'd make a call to graph.facebook.com/me?access_token=token
      // Or call it via our bridge if running inside Desktop Profile / Chrome extension
      const browserBridgeApi = getBrowserBridgeApi();
      if (browserBridgeApi?.invoke) {
        const result = await browserBridgeApi.invoke<{ isValid?: boolean }>("facebook:validate-token", { token });
        return result?.isValid || false;
      }
      // Local fallback check for the UI dashboard (tokens starting with EAA and > 50 chars).
      return tokenManager.isValidToken(token);
    } catch {
      return false;
    }
  }

  /**
   * Refresh all 4 types of tokens (EAAG, EAAB, EAAI, EAAH) using active session cookies
   */
  async refreshFullTokens(): Promise<FacebookTokenSet> {
    console.log("[AuthService] Starting full token refresh...");
    const store = useAuthStore.getState();

    try {
      const storedAuth = await this.getStoredFacebookAuth();
      let cookie = sanitizeAuthCookie(store.facebook.profile?.cookie || storedAuth?.cookie || "");

      const sessionInfo = await getFacebookSessionInfo();
      if (sessionInfo?.cookie) {
        cookie = sanitizeAuthCookie(sessionInfo.cookie);
      }

      if (!cookie) {
        store.setAuthContext({ status: "not_login", error: "No cookie available for refresh." });
        return {};
      }

      // Trích xuất tokens từ cookie
      const extractedTokens = tokenManager.extractTokensFromCookie(cookie);
      
      // Use only real tokens that already exist in cookies, bridge data, or IndexedDB.
      const updatedTokens: FacebookTokenSet = {
        ...this.authRecordToTokenSet(storedAuth),
        eaag: sanitizeAuthToken(extractedTokens.eaag || storedAuth?.accessToken || storedAuth?.token),
        eaab: sanitizeAuthToken(extractedTokens.eaab || storedAuth?.accessToken2),
        eaai: sanitizeAuthToken(extractedTokens.eaai || storedAuth?.accessToken4),
        eaah: sanitizeAuthToken(extractedTokens.eaah || storedAuth?.accessToken5),
      };

      if (!Object.values(updatedTokens).some(Boolean)) {
        store.setAuthContext({
          status: "not_login",
          error: "No real Facebook tokens were returned by the bridge or IndexedDB.",
        });
        return {};
      }

      const uid = sessionInfo?.uid || cookie.match(/c_user=(\d+)/)?.[1] || storedAuth?.uid || store.facebook.uid || store.facebook.profile?.uid || "";
      if (uid) {
        store.setProfile({
          uid,
          name: sessionInfo?.name || storedAuth?.name || store.facebook.profile?.name || "Facebook User",
          cookie,
          avatarUrl: `https://graph.facebook.com/${uid}/picture?type=normal`,
          tokenSet: {
            ...(store.facebook.profile?.tokenSet || {}),
            ...updatedTokens,
          },
        });
      }

      await this.saveStoredFacebookAuth({
        uid,
        name: sessionInfo?.name || storedAuth?.name || store.facebook.profile?.name || "Facebook User",
        cookie,
        accessToken: updatedTokens.eaag,
        token: updatedTokens.eaag,
        accessToken2: updatedTokens.eaab,
        accessToken4: updatedTokens.eaai,
        accessToken5: updatedTokens.eaah,
        dtsg: storedAuth?.dtsg,
        dtsg2: storedAuth?.dtsg2,
        lsd: storedAuth?.lsd,
      });

      store.updateTokens(updatedTokens);
      store.setAuthContext({ status: "ok", error: undefined, lastChecked: Date.now() });
      console.log("[AuthService] Full tokens refreshed successfully.");
      return updatedTokens;
    } catch (err) {
      console.error("[AuthService] Failed to refresh tokens:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh Facebook tokens.";
      store.setAuthContext({ status: "extension_unavailable", error: errorMessage });
      return {};
    }
  }

  /**
   * Sync active Facebook user cookie and initialize profile
   */
  async syncFacebookAuthCookie(cookie: string): Promise<boolean> {
    const store = useAuthStore.getState();
    cookie = sanitizeAuthCookie(cookie);
    if (!cookie) return false;

    try {
      const cUserMatch = cookie.match(/c_user=(\d+)/);
      const uid = cUserMatch ? cUserMatch[1] : "";

      if (!uid) {
        store.setStatus("not_login");
        return false;
      }
      
      const profile: FacebookUserProfile = {
        uid,
        name: "Võ Thế Công",
        cookie,
        avatarUrl: `https://graph.facebook.com/${uid}/picture?type=normal`,
        tokenSet: {},
      };

      store.setProfile(profile);
      store.setStatus("ok");

      await this.saveStoredFacebookAuth({
        uid,
        name: profile.name,
        cookie,
      });
      
      // Auto-trigger full token load
      await this.refreshFullTokens();
      return true;
    } catch (err) {
      console.error("[AuthService] Cookie sync error:", err);
      store.setStatus("not_login");
      return false;
    }
  }
}

export const facebookAuthService = new FacebookAuthService();
