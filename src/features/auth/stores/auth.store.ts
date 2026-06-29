import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthContext, FacebookUserProfile, FacebookTokenSet, CheckpointState } from "../types";

interface AuthState extends AuthContext {
  setAuthContext: (context: Partial<AuthContext>) => void;
  updateTokens: (tokens: Partial<FacebookTokenSet>) => void;
  setStatus: (status: CheckpointState) => void;
  setProfile: (profile: FacebookUserProfile | null) => void;
  clearAuth: () => void;
}

const initialContext: AuthContext = {
  uid: null,
  profile: null,
  status: "not_login",
  error: undefined,
  lastChecked: undefined,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialContext,

      setAuthContext: (context) =>
        set((state) => ({
          ...state,
          ...context,
        })),

      updateTokens: (tokens) =>
        set((state) => {
          const currentProfile = state.profile || { uid: state.uid || "", name: "Facebook User" };
          const currentTokens = currentProfile.tokenSet || {};
          const newTokenSet: FacebookTokenSet = {
            ...currentTokens,
            ...tokens,
          };
          return {
            profile: {
              ...currentProfile,
              tokenSet: newTokenSet,
            },
          };
        }),

      setStatus: (status) => set({ status }),

      setProfile: (profile) => set({ profile, uid: profile ? profile.uid : null }),

      clearAuth: () => set(initialContext),
    }),
    {
      name: "facebook-auth-store", // Name of the key in storage
      storage: createJSONStorage(() => localStorage), // Store in localStorage
    }
  )
);
