import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AUTH_STORE_KEY,
  LEGACY_FB_AUTH_STORE_KEY,
} from "../constants";
import {
  AuthState,
  initialFacebookSession,
  initialPlatformSession,
} from "../types";
import { clearAllSessionCookies } from "../utils/session-cookie";
import { decodeJwtTenantContext } from "../utils/jwt-decode";
import { tokenValidationService } from "../services/token-validation.service";

function migratePlatformTenant(
  platform: AuthState["platform"]
): AuthState["platform"] {
  const tenant =
    platform.tenant && typeof platform.tenant === "object"
      ? platform.tenant
      : {};

  if (
    platform.nestToken &&
    !tenant.organizationId &&
    !tenant.tenantId
  ) {
    return {
      ...platform,
      tenant: decodeJwtTenantContext(platform.nestToken),
    };
  }

  return { ...platform, tenant };
}

function migrateLegacyFacebookStore(): Partial<AuthState["facebook"]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_FB_AUTH_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: {
        uid?: string | null;
        profile?: AuthState["facebook"]["profile"];
        status?: AuthState["facebook"]["status"];
        error?: string;
        lastChecked?: number;
        tokenExpiresAt?: AuthState["facebook"]["tokenExpiresAt"];
      };
    };
    localStorage.removeItem(LEGACY_FB_AUTH_STORE_KEY);
    if (!parsed.state) return null;
    return {
      uid: parsed.state.uid ?? null,
      profile: parsed.state.profile ?? null,
      status: parsed.state.status ?? "not_login",
      error: parsed.state.error,
      lastChecked: parsed.state.lastChecked,
      tokenExpiresAt: parsed.state.tokenExpiresAt,
    };
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
        set((state) => ({
          platform: { ...state.platform, ...session },
        })),

      setPlatformStatus: (platformStatus) => set({ platformStatus }),

      setAuthBootstrapped: (authBootstrapped) => set({ authBootstrapped }),

      setFacebookContext: (ctx) =>
        set((state) => ({
          facebook: { ...state.facebook, ...ctx },
        })),

      setProfile: (profile) =>
        set((state) => ({
          facebook: {
            ...state.facebook,
            uid: profile.uid,
            profile,
          },
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
        set((state) => ({
          facebook: { ...state.facebook, ...ctx },
        })),

      setStatus: (status) =>
        set((state) => ({
          facebook: { ...state.facebook, status },
        })),

      clearAuth: () => {
        tokenValidationService.clearCache();
        set((state) => ({
          facebook: { ...initialFacebookSession },
          platform: state.platform,
          platformStatus: state.platformStatus,
        }));
      },

      clearPlatformAuth: () => {
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
          authMode: state.platform.authMode,
          nestToken: state.platform.nestToken,
          nestTokenExp: state.platform.nestTokenExp,
          supabaseAccessToken: state.platform.supabaseAccessToken,
          supabaseRefreshToken: state.platform.supabaseRefreshToken,
          profile: state.platform.profile,
          tenant: state.platform.tenant,
        },
        platformStatus: state.platformStatus,
        facebook: state.facebook,
      }),
      merge: (persisted, current) => {
        const merged = {
          ...current,
          ...(persisted as Partial<AuthState>),
          platform: {
            ...current.platform,
            ...(persisted as AuthState)?.platform,
          },
        };
        return {
          ...merged,
          platform: migratePlatformTenant(merged.platform),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setPlatformSession(
            migratePlatformTenant(state.platform)
          );
        }
        const legacy = migrateLegacyFacebookStore();
        if (legacy && state) {
          state.setFacebookContext(legacy);
        }
      },
    }
  )
);