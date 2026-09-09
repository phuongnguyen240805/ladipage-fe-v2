import { useAuthStore } from "../stores/auth.store";
import { decodeJwtExp, decodeJwtTenantContext } from "../utils/jwt-decode";
import { setNestSessionCookie } from "../utils/session-cookie";
import { backendSessionService } from "./backend-session.service";

export class TokenRefreshService {
  private refreshPromise: Promise<string> | null = null;

  refreshNestToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<string> {
    const token = await backendSessionService.refreshAccessToken();
    const store = useAuthStore.getState();
    const nestTokenExp = decodeJwtExp(token);

    store.setPlatformSession({
      nestToken: token,
      nestTokenExp,
      tenant: decodeJwtTenantContext(token),
    });
    store.setPlatformStatus("authenticated");
    setNestSessionCookie(token);

    return token;
  }

  shouldProactiveRefresh(): boolean {
    const { nestToken, nestTokenExp } = useAuthStore.getState().platform;
    if (!nestToken) return false;
    const exp = nestTokenExp ?? decodeJwtExp(nestToken);
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return exp - now < 5 * 60;
  }
}

export const tokenRefreshService = new TokenRefreshService();