import type { LoginToken } from "@liora/api-types";
import { accountApi } from "@/lib/endpoints/account.api";
import { authApi } from "@/lib/endpoints/auth.api";
import { PASSWORD_REGEX } from "../constants";
import { useAuthStore } from "../stores/auth.store";
import { flushAuthPersist } from "../utils/auth-persist";
import { withSuppressedSessionRedirect } from "../utils/auth-session-guard";
import {
  decodeJwtExp,
  decodeJwtTenantContext,
  isJwtExpired,
} from "../utils/jwt-decode";
import { setNestSessionCookie } from "../utils/session-cookie";
import { backendSessionService } from "./backend-session.service";

const ACCOUNT_CONTEXT_REVALIDATE_DELAY_MS = 750;

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
      const session = await authApi.login({
        email: email.trim(),
        password,
        captchaId,
        verifyCode: verifyCode.trim(),
      });
      await this.applyNestSession(session);
    } catch (err) {
      store.setPlatformStatus("unauthenticated");
      throw err;
    }
  }

  async signInWithGoogleIdToken(
    idToken: string,
    nonce?: string,
  ): Promise<void> {
    const credential = idToken.trim();
    const rawNonce = nonce?.trim();
    if (!credential) {
      throw new Error("Google không trả về thông tin đăng nhập hợp lệ.");
    }

    const store = useAuthStore.getState();
    store.setPlatformStatus("loading");

    try {
      const session = await authApi.googleLogin({
        idToken: credential,
        ...(rawNonce ? { nonce: rawNonce } : {}),
      });
      await this.applyNestSession(session);
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

  async applyNestSession(session: LoginToken): Promise<void> {
    await backendSessionService.persistTokenPair(session);

    const store = useAuthStore.getState();
    const nestTokenExp = decodeJwtExp(session.token);

    store.setPlatformSession({
      nestToken: session.token,
      nestTokenExp,
      tenant: decodeJwtTenantContext(session.token),
    });
    store.setPlatformStatus("authenticated");
    setNestSessionCookie(session.token);

    await withSuppressedSessionRedirect(async () => {
      await this.ensureTenantToken();
      await this.loadAccountContext();
    });
  }

  completeLoginRedirect(redirectPath: string): void {
    const store = useAuthStore.getState();
    const { nestToken } = store.platform;
    if (nestToken) {
      setNestSessionCookie(nestToken);
    }
    flushAuthPersist();
    store.setAuthBootstrapped(true);
    store.setPlatformStatus("authenticated");

    const path =
      redirectPath.startsWith("/") && !redirectPath.startsWith("//")
        ? redirectPath
        : "/";
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
      const session = await accountApi.reissueToken();
      await backendSessionService.persistTokenPair(session);

      const nestTokenExp = decodeJwtExp(session.token);
      store.setPlatformSession({
        nestToken: session.token,
        nestTokenExp,
        tenant: decodeJwtTenantContext(session.token),
      });
      setNestSessionCookie(session.token);
    } catch (err) {
      console.warn("[PlatformAuth] Tenant token reissue failed:", err);
    }
  }

  async loadAccountContext(): Promise<void> {
    const store = useAuthStore.getState();
    const [profileResult, permissionsResult, menusResult] =
      await Promise.allSettled([
        accountApi.getProfile(),
        accountApi.getPermissions(),
        accountApi.getMenus(),
      ]);

    if (profileResult.status === "fulfilled") {
      store.setPlatformSession({ profile: profileResult.value });
    } else {
      console.warn(
        "[PlatformAuth] Failed to load account profile:",
        profileResult.reason,
      );
    }

    if (permissionsResult.status === "fulfilled") {
      store.setPlatformSession({ permissions: permissionsResult.value });
    } else {
      console.warn(
        "[PlatformAuth] Failed to load account permissions:",
        permissionsResult.reason,
      );
    }

    if (menusResult.status === "fulfilled") {
      store.setPlatformSession({ menus: menusResult.value });
    } else {
      console.warn(
        "[PlatformAuth] Failed to load account menus:",
        menusResult.reason,
      );
    }
  }

  async initializeFromStore(): Promise<boolean> {
    const store = useAuthStore.getState();
    const bridgedToken = await backendSessionService
      .readAccessToken()
      .catch(() => null);

    if (bridgedToken && bridgedToken !== store.platform.nestToken) {
      store.setPlatformSession({
        nestToken: bridgedToken,
        nestTokenExp: decodeJwtExp(bridgedToken),
        tenant: decodeJwtTenantContext(bridgedToken),
      });
      flushAuthPersist();
    }

    let { nestToken, tenant } = useAuthStore.getState().platform;

    if (!nestToken) {
      try {
        nestToken = await backendSessionService.refreshAccessToken();
        tenant = decodeJwtTenantContext(nestToken);
        store.setPlatformSession({
          nestToken,
          nestTokenExp: decodeJwtExp(nestToken),
          tenant,
        });
        flushAuthPersist();
      } catch {
        store.setPlatformStatus("unauthenticated");
        return false;
      }
    }

    if (!tenant?.organizationId && !tenant?.tenantId) {
      store.setPlatformSession({
        tenant: decodeJwtTenantContext(nestToken),
      });
    }

    setNestSessionCookie(nestToken);

    const canUseCachedAccountContext =
      Boolean(store.platform.profile) && !isJwtExpired(nestToken, 60);

    store.setPlatformStatus("loading");
    try {
      // Tenant reissue can change the JWT and must stay on the blocking auth
      // path. For a normal persisted session this is a local no-op.
      await withSuppressedSessionRedirect(async () => {
        await this.ensureTenantToken();
      });

      const currentToken = useAuthStore.getState().platform.nestToken;
      if (currentToken) {
        setNestSessionCookie(currentToken);
        flushAuthPersist();
      }

      if (canUseCachedAccountContext) {
        // The persisted profile/permissions/menus were already validated on a
        // previous successful session. Render immediately, then refresh that
        // context in the background (stale-while-revalidate). Any real 401 is
        // still handled by the normal API interceptor/token-refresh flow.
        store.setPlatformStatus("authenticated");
        const bootstrapToken = currentToken;
        const revalidateCachedAccountContext = () => {
          if (useAuthStore.getState().platform.nestToken !== bootstrapToken) {
            return;
          }
          void this.loadAccountContext()
            .then(() => flushAuthPersist())
            .catch((error) => {
              console.warn(
                "[PlatformAuth] Background account refresh failed:",
                error,
              );
            });
        };
        if (typeof window === "undefined") {
          revalidateCachedAccountContext();
        } else {
          window.setTimeout(
            revalidateCachedAccountContext,
            ACCOUNT_CONTEXT_REVALIDATE_DELAY_MS,
          );
        }
        return true;
      }

      // First session / missing cached profile keeps the original blocking
      // behaviour so the application never renders without account context.
      await withSuppressedSessionRedirect(async () => {
        await this.loadAccountContext();
      });
      flushAuthPersist();
      store.setPlatformStatus("authenticated");
      return true;
    } catch {
      try {
        const { tokenRefreshService } = await import(
          "./token-refresh.service"
        );
        await withSuppressedSessionRedirect(async () => {
          await tokenRefreshService.refreshNestToken();
          await this.loadAccountContext();
        });
        flushAuthPersist();
        store.setPlatformStatus("authenticated");
        return true;
      } catch {
        store.clearPlatformAuth();
        return false;
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await accountApi.logout();
    } catch {
      // The local session still has to be cleared if the backend is unreachable.
    }

    try {
      await backendSessionService.clearSession();
    } catch {
      // clearAllAuth below still clears browser-visible legacy cookies.
    }

    useAuthStore.getState().clearAllAuth();
  }
}

export const platformAuthService = new PlatformAuthService();
