import { authApi } from "@/lib/endpoints/auth.api";
import { accountApi } from "@/lib/endpoints/account.api";
import { getSupabaseClient } from "@/lib/supabase/supabase.client";
import { PASSWORD_REGEX } from "../constants";
import { useAuthStore } from "../stores/auth.store";
import { getAuthMode, isLegacyAuthMode } from "../utils/auth-mode";
import { flushAuthPersist } from "../utils/auth-persist";
import { withSuppressedSessionRedirect } from "../utils/auth-session-guard";
import { decodeJwtExp, decodeJwtTenantContext } from "../utils/jwt-decode";
import {
  setNestSessionCookie,
  setSupabaseRefreshCookie,
} from "../utils/session-cookie";

export class PlatformAuthService {
  validatePassword(password: string): string | null {
    if (!PASSWORD_REGEX.test(password)) {
      return "Mật khẩu cần ít nhất 6 ký tự, có chữ hoa và số.";
    }
    if (password.length > 16) {
      return "Mật khẩu tối đa 16 ký tự.";
    }
    return null;
  }

  async signInWithCaptcha(
    email: string,
    password: string,
    captchaId: string,
    verifyCode: string
  ): Promise<void> {
    const store = useAuthStore.getState();
    store.setPlatformStatus("loading");

    try {
      const { token } = await authApi.login({
        email: email.trim(),
        password,
        captchaId,
        verifyCode: verifyCode.trim(),
      });
      await this.applyNestToken(token, "legacy");
    } catch (err) {
      store.setPlatformStatus("unauthenticated");
      throw err;
    }
  }

  async signInWithSupabase(email: string, password: string): Promise<void> {
    const store = useAuthStore.getState();
    store.setPlatformStatus("loading");

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        throw new Error(error?.message ?? "Đăng nhập Supabase thất bại");
      }

      await this.applySupabaseSession(
        data.session.access_token,
        data.session.refresh_token
      );
    } catch (err) {
      store.setPlatformStatus("unauthenticated");
      throw err;
    }
  }

  async signIn(
    email: string,
    password: string,
    captcha: { captchaId: string; verifyCode: string }
  ): Promise<void> {
    if (!captcha.captchaId || !captcha.verifyCode) {
      throw new Error("Vui lòng nhập mã captcha.");
    }
    return this.signInWithCaptcha(
      email,
      password,
      captcha.captchaId,
      captcha.verifyCode
    );
  }

  async signUp(
    email: string,
    password: string,
    username: string
  ): Promise<{ message?: string }> {
    const pwdError = this.validatePassword(password);
    if (pwdError) throw new Error(pwdError);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      throw new Error("Tên người dùng cần ít nhất 2 ký tự.");
    }

    const result = await authApi.register({
      username: trimmedUsername,
      email: email.trim(),
      password,
      lang: "VI",
    });

    return { message: result?.message };
  }

  async applyNestToken(
    token: string,
    authMode: ReturnType<typeof getAuthMode> = getAuthMode()
  ): Promise<void> {
    const store = useAuthStore.getState();
    const nestTokenExp = decodeJwtExp(token);

    store.setPlatformSession({
      authMode,
      nestToken: token,
      nestTokenExp,
      tenant: decodeJwtTenantContext(token),
      supabaseAccessToken: authMode === "supabase" ? store.platform.supabaseAccessToken : null,
      supabaseRefreshToken:
        authMode === "supabase" ? store.platform.supabaseRefreshToken : null,
    });
    store.setPlatformStatus("authenticated");
    setNestSessionCookie(token);
    await withSuppressedSessionRedirect(async () => {
      await this.ensureTenantToken();
      await this.loadAccountContext();
    });
  }

  async applySupabaseSession(
    supabaseAccessToken: string,
    supabaseRefreshToken: string | null
  ): Promise<void> {
    const store = useAuthStore.getState();
    const { token } = await authApi.exchange({ supabaseAccessToken });
    const nestTokenExp = decodeJwtExp(token);

    store.setPlatformSession({
      authMode: "supabase",
      nestToken: token,
      nestTokenExp,
      tenant: decodeJwtTenantContext(token),
      supabaseAccessToken,
      supabaseRefreshToken,
    });
    store.setPlatformStatus("authenticated");

    setNestSessionCookie(token);
    if (supabaseRefreshToken) {
      setSupabaseRefreshCookie(supabaseRefreshToken);
    }

    await withSuppressedSessionRedirect(async () => {
      await this.ensureTenantToken();
      await this.loadAccountContext();
    });
  }

  completeLoginRedirect(redirectPath: string): void {
    const store = useAuthStore.getState();
    const token = store.platform.nestToken;
    if (token) {
      setNestSessionCookie(token);
    }
    flushAuthPersist();
    store.setAuthBootstrapped(true);
    store.setPlatformStatus("authenticated");

    const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  }

  private needsTenantReissue(
    token: string,
    tenant: ReturnType<typeof decodeJwtTenantContext>
  ): boolean {
    const ctx =
      tenant.organizationId || tenant.tenantId != null
        ? tenant
        : decodeJwtTenantContext(token);
    return !ctx.organizationId || ctx.tenantId == null;
  }

  async ensureTenantToken(): Promise<void> {
    const store = useAuthStore.getState();
    const { nestToken, tenant } = store.platform;
    if (!nestToken || !this.needsTenantReissue(nestToken, tenant)) {
      return;
    }

    try {
      const { token } = await accountApi.reissueToken();
      const nestTokenExp = decodeJwtExp(token);
      store.setPlatformSession({
        nestToken: token,
        nestTokenExp,
        tenant: decodeJwtTenantContext(token),
      });
      setNestSessionCookie(token);
    } catch (err) {
      console.warn("[PlatformAuth] Tenant token reissue failed:", err);
    }
  }

  async loadAccountContext(): Promise<void> {
    const store = useAuthStore.getState();
    try {
      const [profile, permissions, menus] = await Promise.all([
        accountApi.getProfile(),
        accountApi.getPermissions(),
        accountApi.getMenus(),
      ]);
      store.setPlatformSession({ profile, permissions, menus });
    } catch (err) {
      console.warn("[PlatformAuth] Failed to load account context:", err);
    }
  }

  async initializeFromStore(): Promise<boolean> {
    const store = useAuthStore.getState();
    const { nestToken, authMode, tenant } = store.platform;

    if (!nestToken) {
      store.setPlatformStatus("unauthenticated");
      return false;
    }

    if (!tenant?.organizationId && !tenant?.tenantId) {
      store.setPlatformSession({
        tenant: decodeJwtTenantContext(nestToken),
      });
    }

    if (nestToken) {
      setNestSessionCookie(nestToken);
    }

    store.setPlatformStatus("loading");
    try {
      await withSuppressedSessionRedirect(async () => {
        await this.ensureTenantToken();
        await this.loadAccountContext();
      });
      const currentToken = useAuthStore.getState().platform.nestToken;
      if (currentToken) {
        setNestSessionCookie(currentToken);
        flushAuthPersist();
      }
      store.setPlatformStatus("authenticated");
      return true;
    } catch {
      if (authMode === "supabase" && store.platform.supabaseRefreshToken) {
        try {
          const { tokenRefreshService } = await import("./token-refresh.service");
          await withSuppressedSessionRedirect(async () => {
            await tokenRefreshService.refreshNestToken();
            await this.loadAccountContext();
          });
          store.setPlatformStatus("authenticated");
          return true;
        } catch {
          store.clearPlatformAuth();
          return false;
        }
      }
      store.clearPlatformAuth();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await accountApi.logout();
    } catch {
      // ignore
    }

    if (!isLegacyAuthMode()) {
      try {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }

    useAuthStore.getState().clearAllAuth();
  }
}

export const platformAuthService = new PlatformAuthService();