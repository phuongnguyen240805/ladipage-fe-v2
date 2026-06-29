import type { FacebookTokenSet } from "@/features/auth/types";

declare global {
  interface Window {
    ViaFacebookAuthGuard?: {
      refreshAllTokensDirect?: () => Promise<FacebookTokenSet | Record<string, unknown>>;
      refreshFullTokens?: (options?: { forceTokenRefresh?: boolean }) => Promise<FacebookTokenSet | Record<string, unknown>>;
      syncFacebookAuthCookie?: () => Promise<unknown>;
    };
  }
}

export {};
