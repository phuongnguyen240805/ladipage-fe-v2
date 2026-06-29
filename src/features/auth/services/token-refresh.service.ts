import { authApi } from "@/lib/endpoints/auth.api";
import { getSupabaseClient } from "@/lib/supabase/supabase.client";
import { useAuthStore } from "../stores/auth.store";
import { decodeJwtExp } from "../utils/jwt-decode";
import {
  setNestSessionCookie,
  setSupabaseRefreshCookie,
} from "../utils/session-cookie";

export class TokenRefreshService {
  async refreshNestToken(): Promise<string> {
    const store = useAuthStore.getState();

    if (store.platform.authMode === "legacy") {
      throw new Error("Legacy auth: vui lòng đăng nhập lại");
    }

    const refreshToken = store.platform.supabaseRefreshToken;

    if (!refreshToken) {
      throw new Error("No Supabase refresh token available");
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error(error?.message ?? "Supabase session refresh failed");
    }

    const { token } = await authApi.exchange({
      supabaseAccessToken: data.session.access_token,
    });

    const nestTokenExp = decodeJwtExp(token);

    store.setPlatformSession({
      authMode: "supabase",
      nestToken: token,
      nestTokenExp,
      supabaseAccessToken: data.session.access_token,
      supabaseRefreshToken: data.session.refresh_token,
    });
    store.setPlatformStatus("authenticated");

    setNestSessionCookie(token);
    if (data.session.refresh_token) {
      setSupabaseRefreshCookie(data.session.refresh_token);
    }

    return token;
  }

  shouldProactiveRefresh(): boolean {
    const { nestToken, nestTokenExp, authMode, supabaseRefreshToken } =
      useAuthStore.getState().platform;
    if (authMode === "legacy" || !supabaseRefreshToken) return false;
    if (!nestToken) return false;
    const exp = nestTokenExp ?? decodeJwtExp(nestToken);
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return exp - now < 5 * 60;
  }
}

export const tokenRefreshService = new TokenRefreshService();