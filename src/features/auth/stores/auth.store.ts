import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AUTH_STORE_KEY, LEGACY_FB_AUTH_STORE_KEY } from "../constants";
import {
  AuthState,
  initialFacebookSession,
  initialPlatformSession,
} from "../types";
import {
  clearAllSessionCookies,
  clearPlatformSessionCookies,
} from "../utils/session-cookie";
import { decodeJwtTenantContext } from "../utils/jwt-decode";
import { tokenValidationService } from "../services/token-validation.service";

function sanitizePersistedPlatform(value: unknown): AuthState["platform"] {
  const platform = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
  const legacyToken = typeof platform.nestToken === "string" ? platform.nestToken : null;
  const tenant =
    platform.tenant && typeof platform.tenant === "object"
      ? platform.tenant as AuthState["platform"]["tenant"]
      : legacyToken
        ? decodeJwtTenantContext(legacyToken)
        : {};

  return {
    sessionExpiresAt:
      typeof platform.sessionExpiresAt === "number"
        ? platform.sessionExpiresAt
        : null,
    profile: (platform.profile as AuthState["platform"]["profile"]) ?? null,
    permissions: Array.isArray(platform.permissions)
      ? platform.permissions as string[]
      : [],
    menus: Array.isArray(platform.menus)
      ? platform.menus as AuthState["platform"]["menus"]
      : [],
    tenant,
  };
}

function sanitizePersistedFacebook(value: unknown): AuthState["facebook"] {
  const facebook = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
  const rawProfile = facebook.profile && typeof facebook.profile === "object"
    ? facebook.profile as Record<string, unknown>
    : null;

  const profile = rawProfile && typeof rawProfile.uid === "string" && typeof rawProfile.name === "string"
    ? {
        uid: rawProfile.uid,
        name: rawProfile.name,
        ...(typeof rawProfile.avatarUrl === "string" ? { avatarUrl: rawProfile.avatarUrl } : {}),
      }
    : null;

  const allowedStatuses = new Set(["ok", "not_login", "checkpoint_282", "checkpoint_956", "extension_unavailable"]);
  const status = typeof facebook.status === "string" && allowedStatuses.has(facebook.status)
    ? facebook.status as AuthState["facebook"]["status"]
    : "not_login";

  return {
    uid: typeof facebook.uid === "string" ? facebook.uid : profile?.uid ?? null,
    profile,
    status,
    error: typeof facebook.error === "string" ? facebook.error : undefined,
    lastChecked: typeof facebook.lastChecked === "number" ? facebook.lastChecked : undefined,
    // Provider credentials and expiry metadata are intentionally memory-only.
    tokenExpiresAt: undefined,
  };
}

/**
 * Remove bearer/provider material left by pre-Phase-12 persisted auth state
 * without deleting unrelated localStorage keys.
 */
function scrubPersistedAuthStore(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(AUTH_STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      state?: Record<string, unknown>;
      version?: number;
    };
    if (!parsed.state) return;
    parsed.state = {
      ...parsed.state,
      platform: sanitizePersistedPlatform(parsed.state.platform),
      facebook: sanitizePersistedFacebook(parsed.state.facebook),
    };
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(parsed));
  } catch {
    // Corrupt persisted auth state is ignored; the normal bootstrap will
    // replace it from the authoritative server-owned session.
  }
}

function migrateLegacyFacebookStore(): Partial<AuthState["facebook"]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_FB_AUTH_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: Partial<AuthState["facebook"]>;
    };
    localStorage.removeItem(LEGACY_FB_AUTH_STORE_KEY);
    return parsed.state ? sanitizePersistedFacebook(parsed.state) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      platform: { ...initialPlatformSession },
      platformStatus: "idle",
      authBootstrapped: false,
      facebook: { ...initialFacebookSession },

      setPlatformSession: (session) =>
        set((state) => ({ platform: { ...state.platform, ...session } })),
      setPlatformStatus: (platformStatus) => set({ platformStatus }),
      setAuthBootstrapped: (authBootstrapped) => set({ authBootstrapped }),
      setFacebookContext: (ctx) =>
        set((state) => ({ facebook: { ...state.facebook, ...ctx } })),
      setProfile: (profile) =>
        set((state) => ({
          facebook: { ...state.facebook, uid: profile.uid, profile },
        })),
      updateTokens: (tokens) =>
        set((state) => {
          const currentProfile = state.facebook.profile;
          if (!currentProfile) return state;
          return {
            facebook: {
              ...state.facebook,
              profile: {
                ...currentProfile,
                tokenSet: { ...currentProfile.tokenSet, ...tokens },
              },
            },
          };
        }),
      setAuthContext: (ctx) =>
        set((state) => ({ facebook: { ...state.facebook, ...ctx } })),
      setStatus: (status) =>
        set((state) => ({ facebook: { ...state.facebook, status } })),

      clearAuth: () => {
        tokenValidationService.clearCache();
        set((state) => ({
          facebook: { ...initialFacebookSession },
          platform: state.platform,
          platformStatus: state.platformStatus,
        }));
      },
      clearPlatformAuth: () => {
        tokenValidationService.clearCache();
        clearPlatformSessionCookies();
        set((state) => ({
          platform: { ...initialPlatformSession },
          platformStatus: "unauthenticated",
          authBootstrapped: state.authBootstrapped,
          facebook: state.facebook,
        }));
      },
      clearFacebookAuth: () => {
        tokenValidationService.clearCache();
        set((state) => ({
          facebook: { ...initialFacebookSession },
          platform: state.platform,
          platformStatus: state.platformStatus,
        }));
      },
      clearAllAuth: () => {
        clearAllSessionCookies();
        tokenValidationService.clearCache();
        set((state) => ({
          platform: { ...initialPlatformSession },
          platformStatus: "unauthenticated",
          authBootstrapped: state.authBootstrapped,
          facebook: { ...initialFacebookSession },
        }));
      },
    }),
    {
      name: AUTH_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        platform: {
          sessionExpiresAt: state.platform.sessionExpiresAt,
          profile: state.platform.profile,
          permissions: state.platform.permissions,
          menus: state.platform.menus,
          tenant: state.platform.tenant,
        },
        facebook: sanitizePersistedFacebook(state.facebook),
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<AuthState>;
        return {
          ...current,
          platform: sanitizePersistedPlatform(persistedState.platform),
          facebook: sanitizePersistedFacebook(persistedState.facebook ?? current.facebook),
          // Server-owned HttpOnly session is authoritative on every bootstrap.
          platformStatus: "idle",
          authBootstrapped: false,
        };
      },
      onRehydrateStorage: () => (state) => {
        const legacy = migrateLegacyFacebookStore();
        if (legacy && state) state.setFacebookContext(legacy);
        scrubPersistedAuthStore();
      },
    },
  ),
);
