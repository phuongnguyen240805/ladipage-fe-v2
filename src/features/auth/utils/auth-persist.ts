import { AUTH_STORE_KEY } from "../constants";
import type { AuthState } from "../types";
import { useAuthStore } from "../stores/auth.store";

type PersistedAuthSlice = Pick<
  AuthState,
  "platform" | "platformStatus" | "facebook"
>;

function buildPersistPayload(): PersistedAuthSlice {
  const state = useAuthStore.getState();
  return {
    platform: {
      authMode: state.platform.authMode,
      nestToken: state.platform.nestToken,
      nestTokenExp: state.platform.nestTokenExp,
      supabaseAccessToken: state.platform.supabaseAccessToken,
      supabaseRefreshToken: state.platform.supabaseRefreshToken,
      profile: state.platform.profile,
      permissions: state.platform.permissions,
      menus: state.platform.menus,
      tenant: state.platform.tenant,
    },
    platformStatus: state.platformStatus,
    facebook: state.facebook,
  };
}

/** Force-write zustand auth slice to localStorage before navigation. */
export function flushAuthPersist(): void {
  if (typeof window === "undefined") return;
  const payload = {
    state: buildPersistPayload(),
    version: 0,
  };
  localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(payload));
}

/**
 * Rehydrate from localStorage without clobbering a fresher in-memory session
 * (e.g. token just set during login before persist flush).
 */
export async function safeRehydrateAuthStore(): Promise<void> {
  const memoryToken = useAuthStore.getState().platform.nestToken;
  const memoryStatus = useAuthStore.getState().platformStatus;
  const memoryPlatform = useAuthStore.getState().platform;

  await useAuthStore.persist.rehydrate();

  const store = useAuthStore.getState();
  if (memoryToken && !store.platform.nestToken) {
    store.setPlatformSession({
      authMode: memoryPlatform.authMode,
      nestToken: memoryToken,
      nestTokenExp: memoryPlatform.nestTokenExp,
      supabaseAccessToken: memoryPlatform.supabaseAccessToken,
      supabaseRefreshToken: memoryPlatform.supabaseRefreshToken,
      profile: memoryPlatform.profile,
      tenant: memoryPlatform.tenant,
    });
    if (memoryStatus === "authenticated" || memoryStatus === "loading") {
      store.setPlatformStatus(memoryStatus);
    }
  }
}