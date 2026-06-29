"use client";

import { useAuthStore } from "../stores/auth.store";

export function usePlatformAuth() {
  const platform = useAuthStore((state) => state.platform);
  const platformStatus = useAuthStore((state) => state.platformStatus);
  const authBootstrapped = useAuthStore((state) => state.authBootstrapped);
  const setPlatformSession = useAuthStore((state) => state.setPlatformSession);
  const clearPlatformAuth = useAuthStore((state) => state.clearPlatformAuth);
  const clearAllAuth = useAuthStore((state) => state.clearAllAuth);

  return {
    platform,
    platformStatus,
    authBootstrapped,
    isAuthenticated:
      authBootstrapped &&
      platformStatus === "authenticated" &&
      !!platform.nestToken,
    isLoading: !authBootstrapped || platformStatus === "loading",
    profile: platform.profile,
    permissions: platform.permissions,
    menus: platform.menus,
    setPlatformSession,
    clearPlatformAuth,
    clearAllAuth,
  };
}