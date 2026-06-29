import { useAuthStore } from "../stores/auth.store";
import { facebookAuthService } from "../services/facebook-auth.service";
import { authGuard } from "../services/auth-guard";
import { FacebookTokenSet } from "../types";

export function useFacebookAuth() {
  const uid = useAuthStore((state) => state.uid);
  const profile = useAuthStore((state) => state.profile);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const lastChecked = useAuthStore((state) => state.lastChecked);

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const syncCookie = async (cookie: string) => {
    return facebookAuthService.syncFacebookAuthCookie(cookie);
  };

  const refreshTokens = async () => {
    return facebookAuthService.refreshFullTokens();
  };

  const checkAuth = async () => {
    return authGuard.checkFacebookAuth();
  };

  const ensureToken = async (actionName: string, tokenType: keyof FacebookTokenSet = "eaag") => {
    return facebookAuthService.ensureLiveAccessTokenForAction(actionName, tokenType);
  };

  return {
    uid,
    profile,
    status,
    error,
    lastChecked,
    isAuthenticated: status === "ok" && !!uid,
    syncCookie,
    refreshTokens,
    checkAuth,
    ensureToken,
    logout: clearAuth,
  };
}
