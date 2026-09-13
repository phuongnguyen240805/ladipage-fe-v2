import { accountApi } from "@/lib/endpoints/account.api";
import { authApi } from "@/lib/endpoints/auth.api";
import type { BackendSessionSnapshot } from "@/lib/backend/session-types";
import { PASSWORD_REGEX } from "../constants";
import { useAuthStore } from "../stores/auth.store";
import { flushAuthPersist } from "../utils/auth-persist";
import { withSuppressedSessionRedirect } from "../utils/auth-session-guard";
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
    verifyCode: string,
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
      await this.applySession(session);
    } catch (err) {
      store.setPlatformStatus("unauthenticated");
      throw err;
    }
  }

  async signInWithGoogleIdToken(idToken: string, nonce?: string): Promise<void> {
    const credential = idToken.trim();
    const rawNonce = nonce?.trim();
    if (!credential) throw new Error("Google không trả về thông tin đăng nhập hợp lệ.");

    const store = useAuthStore.getState();
    store.setPlatformStatus("loading");
    try {
      const session = await authApi.googleLogin({
        idToken: credential,
        ...(rawNonce ? { nonce: rawNonce } : {}),
      });
      await this.applySession(session);
    } catch (err) {
      store.setPlatformStatus("unauthenticated");
      throw err;
    }
  }

  async signUpWithGoogleIdToken(idToken: string, nonce?: string): Promise<{ message?: string }> {
    const credential = idToken.trim();
    const rawNonce = nonce?.trim();
    if (!credential) throw new Error("Google không trả về thông tin đăng ký hợp lệ.");
    const result = await authApi.googleRegister({
      idToken: credential,
      ...(rawNonce ? { nonce: rawNonce } : {}),
    });
    return { message: result?.message };
  }

  async signIn(
    email: string,
    password: string,
    captcha: { captchaId: string; verifyCode: string },
  ): Promise<void> {
    if (!captcha.captchaId || !captcha.verifyCode) throw new Error("Vui lòng nhập mã captcha.");
    return this.signInWithCaptcha(email, password, captcha.captchaId, captcha.verifyCode);
  }

  async signUp(email: string, password: string, username: string): Promise<{ message?: string }> {
    const pwdError = this.validatePassword(password);
    if (pwdError) throw new Error(pwdError);
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) throw new Error("Tên người dùng cần ít nhất 2 ký tự.");
    const result = await authApi.register({
      username: trimmedUsername,
      email: email.trim(),
      password,
      lang: "VI",
    });
    return { message: result?.message };
  }

  private applySessionMetadata(session: BackendSessionSnapshot): void {
    const store = useAuthStore.getState();
    store.setPlatformSession({
      sessionExpiresAt: session.expiresAt,
      tenant: session.tenant,
    });
    store.setPlatformStatus(session.authenticated ? "authenticated" : "unauthenticated");
  }

  async applySession(session: BackendSessionSnapshot): Promise<void> {
    if (!session.authenticated) throw new Error("Backend session was not created");
    this.applySessionMetadata(session);
    await withSuppressedSessionRedirect(async () => {
      await this.ensureTenantSession();
      await this.loadAccountContext();
    });
  }

  completeLoginRedirect(redirectPath: string): void {
    const store = useAuthStore.getState();
    flushAuthPersist();
    store.setAuthBootstrapped(true);
    store.setPlatformStatus("authenticated");
    const path = redirectPath.startsWith("/") && !redirectPath.startsWith("//") ? redirectPath : "/";
    if (typeof window !== "undefined") window.location.assign(path);
  }

  async ensureTenantSession(): Promise<void> {
    const store = useAuthStore.getState();
    const tenant = store.platform.tenant;
    if (tenant.organizationId && tenant.tenantId != null) return;
    try {
      const session = await backendSessionService.reissueSession();
      this.applySessionMetadata(session);
    } catch (err) {
      console.warn("[PlatformAuth] Tenant session reissue failed:", err);
    }
  }

  async loadAccountContext(): Promise<void> {
    const store = useAuthStore.getState();
    // Profile is the validation anchor; permissions/menus may degrade independently.
    const profile = await accountApi.getProfile();
    store.setPlatformSession({ profile });

    const [permissionsResult, menusResult] = await Promise.allSettled([
      accountApi.getPermissions(),
      accountApi.getMenus(),
    ]);
    if (permissionsResult.status === "fulfilled") {
      store.setPlatformSession({ permissions: permissionsResult.value });
    } else {
      console.warn("[PlatformAuth] Failed to load account permissions:", permissionsResult.reason);
    }
    if (menusResult.status === "fulfilled") {
      store.setPlatformSession({ menus: menusResult.value });
    } else {
      console.warn("[PlatformAuth] Failed to load account menus:", menusResult.reason);
    }
  }

  async initializeFromStore(): Promise<boolean> {
    const store = useAuthStore.getState();
    let session = await backendSessionService.readSession().catch(() => ({
      authenticated: false,
      expiresAt: null,
      tenant: {},
    }));

    if (!session.authenticated) {
      try {
        session = await backendSessionService.refreshSession();
      } catch {
        store.setPlatformStatus("unauthenticated");
        return false;
      }
    }

    this.applySessionMetadata(session);
    store.setPlatformStatus("loading");

    const now = Math.floor(Date.now() / 1000);
    const canUseCachedAccountContext = Boolean(
      store.platform.profile &&
      session.expiresAt &&
      session.expiresAt - now > 60,
    );

    try {
      await withSuppressedSessionRedirect(async () => this.ensureTenantSession());
      if (canUseCachedAccountContext) {
        store.setPlatformStatus("authenticated");
        window.setTimeout(() => {
          void this.loadAccountContext()
            .then(() => flushAuthPersist())
            .catch((error) => console.warn("[PlatformAuth] Background account refresh failed:", error));
        }, ACCOUNT_CONTEXT_REVALIDATE_DELAY_MS);
        return true;
      }

      await withSuppressedSessionRedirect(async () => this.loadAccountContext());
      flushAuthPersist();
      store.setPlatformStatus("authenticated");
      return true;
    } catch {
      try {
        const refreshed = await backendSessionService.refreshSession();
        this.applySessionMetadata(refreshed);
        await withSuppressedSessionRedirect(async () => this.loadAccountContext());
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
      await backendSessionService.clearSession();
    } catch {
      // Local browser-safe state still has to be cleared if backend is unreachable.
    }
    useAuthStore.getState().clearAllAuth();
  }
}

export const platformAuthService = new PlatformAuthService();
