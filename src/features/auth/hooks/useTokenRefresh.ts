"use client";

import { useEffect, useRef } from "react";
import {
  SESSION_REVALIDATION_TTL_MS,
  TOKEN_EXPIRY_BUFFER_MS,
  isFacebookAdsPath,
} from "../constants";
import { authGuard } from "../services/auth-guard";
import { tokenManager } from "../services/token-manager";
import { tokenRefreshService } from "../services/token-refresh.service";
import { useAuthStore } from "../stores/auth.store";

const POLL_INTERVAL_MS = SESSION_REVALIDATION_TTL_MS;

export function useTokenRefresh(): void {
  const platformStatus = useAuthStore((state) => state.platformStatus);
  const nestToken = useAuthStore((state) => state.platform.nestToken);
  const fbUid = useAuthStore((state) => state.facebook.uid);
  const fbStatus = useAuthStore((state) => state.facebook.status);
  const lastChecked = useAuthStore((state) => state.facebook.lastChecked);
  const tokenExpiresAt = useAuthStore((state) => state.facebook.tokenExpiresAt);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (platformStatus !== "authenticated" || !nestToken) return;

    const runPlatformRefresh = async () => {
      if (document.hidden) return;
      if (tokenRefreshService.shouldProactiveRefresh()) {
        try {
          await tokenRefreshService.refreshNestToken();
        } catch (err) {
          console.warn("[useTokenRefresh] Nest JWT proactive refresh failed:", err);
        }
      }
    };

    void runPlatformRefresh();
    const platformInterval = setInterval(() => void runPlatformRefresh(), 60_000);
    return () => clearInterval(platformInterval);
  }, [platformStatus, nestToken]);

  useEffect(() => {
    if (!fbUid || fbStatus !== "ok") return;

    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    if (!isFacebookAdsPath(pathname)) return;

    const runFbCheck = async () => {
      if (document.hidden) return;

      const needsRefresh =
        tokenManager.shouldRevalidate(lastChecked, SESSION_REVALIDATION_TTL_MS) ||
        tokenManager.isExpired(tokenExpiresAt?.eaag, TOKEN_EXPIRY_BUFFER_MS);

      if (needsRefresh) {
        await authGuard.checkFacebookAuth();
      }
    };

    void runFbCheck();

    intervalRef.current = setInterval(() => {
      void runFbCheck();
    }, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (!document.hidden) void runFbCheck();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fbUid, fbStatus, lastChecked, tokenExpiresAt]);
}