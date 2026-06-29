"use client";

import { useAuthStore } from "../stores/auth.store";

/** Gate TanStack Query until persist rehydrate + auth bootstrap complete. */
export function useAuthQueryEnabled(): boolean {
  return useAuthStore(
    (state) =>
      state.authBootstrapped &&
      state.platformStatus === "authenticated" &&
      !!state.platform.nestToken
  );
}