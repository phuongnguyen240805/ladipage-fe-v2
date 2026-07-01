"use client";

import { selectAuthQueryEnabled } from "../auth-query-enabled";
import { useAuthStore } from "../stores/auth.store";

/** Gate TanStack Query until persist rehydrate + auth bootstrap complete. */
export function useAuthQueryEnabled(): boolean {
  return useAuthStore(selectAuthQueryEnabled);
}