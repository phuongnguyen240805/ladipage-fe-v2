import { AUTH_STORE_KEY } from "../constants";
import { useAuthStore } from "../stores/auth.store";
import { backendSessionService } from "../services/backend-session.service";


function readLegacyNestToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { platform?: { nestToken?: unknown } };
    };
    const token = parsed.state?.platform?.nestToken;
    return typeof token === "string" && token.trim() ? token.trim() : null;
  } catch {
    return null;
  }
}

/** Force-write only browser-safe auth metadata before navigation. */
export function flushAuthPersist(): void {
  if (typeof window === "undefined") return;
  const state = useAuthStore.getState();
  localStorage.setItem(
    AUTH_STORE_KEY,
    JSON.stringify({
      state: {
        platform: {
          sessionExpiresAt: state.platform.sessionExpiresAt,
          profile: state.platform.profile,
          permissions: state.platform.permissions,
          menus: state.platform.menus,
          tenant: state.platform.tenant,
        },
        facebook: state.facebook,
      },
      version: 0,
    }),
  );
}

/** Rehydrate UI-safe metadata without overriding a fresher in-memory login. */
export async function safeRehydrateAuthStore(): Promise<void> {
  const memory = useAuthStore.getState();
  const shouldRestoreMemory =
    memory.platformStatus === "authenticated" || memory.platformStatus === "loading";
  const legacyNestToken = readLegacyNestToken();

  // Preserve a pre-cutover session without persisting its bearer credential.
  // The server validates the token before converting it to an HttpOnly cookie.
  if (legacyNestToken) {
    await backendSessionService
      .bridgeLegacyAccessToken(legacyNestToken)
      .catch(() => undefined);
  }

  await useAuthStore.persist.rehydrate();

  if (shouldRestoreMemory) {
    const store = useAuthStore.getState();
    store.setPlatformSession(memory.platform);
    store.setPlatformStatus(memory.platformStatus);
    store.setAuthBootstrapped(memory.authBootstrapped);
  }

  // Re-write immediately so legacy nestToken/nestTokenExp fields do not remain
  // readable in localStorage when bootstrap fails or the backend is offline.
  flushAuthPersist();
}
