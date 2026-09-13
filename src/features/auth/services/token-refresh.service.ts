import type { BackendSessionSnapshot } from "@/lib/backend/session-types";
import { useAuthStore } from "../stores/auth.store";
import { backendSessionService } from "./backend-session.service";

export class TokenRefreshService {
  private refreshPromise: Promise<BackendSessionSnapshot> | null = null;

  refreshSession(): Promise<BackendSessionSnapshot> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  /** Backwards-compatible method name while callers migrate to session semantics. */
  refreshNestToken(): Promise<BackendSessionSnapshot> {
    return this.refreshSession();
  }

  private async performRefresh(): Promise<BackendSessionSnapshot> {
    const snapshot = await backendSessionService.refreshSession();
    const store = useAuthStore.getState();
    store.setPlatformSession({
      sessionExpiresAt: snapshot.expiresAt,
      tenant: snapshot.tenant,
    });
    store.setPlatformStatus(snapshot.authenticated ? "authenticated" : "unauthenticated");
    return snapshot;
  }

  shouldProactiveRefresh(): boolean {
    const { sessionExpiresAt } = useAuthStore.getState().platform;
    if (!sessionExpiresAt) return false;
    const now = Math.floor(Date.now() / 1000);
    return sessionExpiresAt - now < 5 * 60;
  }
}

export const tokenRefreshService = new TokenRefreshService();
