import { useAuthStore } from "../stores/auth.store";
import { facebookAuthService } from "./facebook-auth.service";
import { CheckpointState } from "../types";

export class AuthGuard {
  /**
   * Check if the active Facebook session is valid.
   * Updates store status and throws or returns status.
   */
  async checkFacebookAuth(): Promise<CheckpointState> {
    const store = useAuthStore.getState();
    const uid = store.uid;

    if (!uid) {
      store.setAuthContext({ status: "not_login", error: "Session missing, please login." });
      return "not_login";
    }

    try {
      // Resolve context
      const context = await facebookAuthService.resolveAuthContext(uid);
      if (context.status !== "ok") {
        return context.status;
      }

      // Check access token
      const token = store.profile?.tokenSet?.eaag;
      if (!token) {
        // Try refresh
        await facebookAuthService.refreshFullTokens();
        const refreshedStore = useAuthStore.getState();
        if (!refreshedStore.profile?.tokenSet?.eaag) {
          store.setStatus("not_login");
          return "not_login";
        }
      }

      store.setStatus("ok");
      return "ok";
    } catch (err: any) {
      console.error("[AuthGuard] Error checking facebook auth:", err);
      store.setAuthContext({ status: "extension_unavailable", error: err.message });
      return "extension_unavailable";
    }
  }

  /**
   * Helper to ensure user is logged in before executing a callback
   */
  async guardAction<T>(actionName: string, callback: () => Promise<T>): Promise<T> {
    const status = await this.checkFacebookAuth();
    if (status !== "ok") {
      throw new Error(`Action '${actionName}' blocked: Facebook session is in state '${status}'`);
    }
    return callback();
  }
}

export const authGuard = new AuthGuard();
