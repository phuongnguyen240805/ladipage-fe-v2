"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountInfo, AccountUpdatePayload } from "@liora/api-types";
import { accountApi } from "@/lib/endpoints/account.api";
import { usePlatformAuth } from "./usePlatformAuth";

export function useProfile() {
  const { profile, isAuthenticated, setPlatformSession } = usePlatformAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await accountApi.getProfile();
      setPlatformSession({ profile: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setPlatformSession]);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      void refresh();
    }
  }, [isAuthenticated, profile, refresh]);

  const updateProfile = useCallback(
    async (payload: AccountUpdatePayload): Promise<AccountInfo | null> => {
      setLoading(true);
      setError(null);
      try {
        await accountApi.updateProfile(payload);
        const data = await accountApi.getProfile();
        setPlatformSession({ profile: data });
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update profile";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setPlatformSession]
  );

  return {
    profile,
    loading,
    error,
    refresh,
    updateProfile,
  };
}