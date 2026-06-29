"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AUTH_STORE_KEY,
  isFacebookAdsPath,
  isPublicAuthPath,
} from "../constants";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import { authGuard } from "../services/auth-guard";
import { platformAuthService } from "../services/platform-auth.service";
import { useAuthStore } from "../stores/auth.store";
import { safeRehydrateAuthStore } from "../utils/auth-persist";
import {
  setFbSessionCookie,
  clearFbSessionCookie,
  setNestSessionCookie,
} from "../utils/session-cookie";

interface AuthProviderProps {
  children: React.ReactNode;
}

function redirectToSignIn(router: ReturnType<typeof useRouter>, pathname: string): void {
  const params = new URLSearchParams({ redirect: pathname });
  router.replace(`/signin?${params.toString()}`);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const platformStatus = useAuthStore((state) => state.platformStatus);
  const nestToken = useAuthStore((state) => state.platform.nestToken);
  const authBootstrapped = useAuthStore((state) => state.authBootstrapped);
  const fbUid = useAuthStore((state) => state.facebook.uid);
  const fbStatus = useAuthStore((state) => state.facebook.status);
  const initializedRef = useRef(false);

  useTokenRefresh();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAuth = async () => {
      const store = useAuthStore.getState();
      store.setAuthBootstrapped(false);

      await safeRehydrateAuthStore();

      const currentPath = window.location.pathname;
      if (isPublicAuthPath(currentPath)) {
        store.setAuthBootstrapped(true);
        return;
      }

      const ok = await platformAuthService.initializeFromStore();
      store.setAuthBootstrapped(true);

      if (!ok) {
        redirectToSignIn(router, currentPath);
        return;
      }

      const token = useAuthStore.getState().platform.nestToken;
      if (token) setNestSessionCookie(token);

      if (isFacebookAdsPath(currentPath)) {
        const hasFbToken =
          !!useAuthStore.getState().facebook.profile?.tokenSet?.eaag;
        if (useAuthStore.getState().facebook.uid && hasFbToken) {
          await authGuard.checkFacebookAuth();
        }
      }
    };

    void initializeAuth();
  }, [router]);

  useEffect(() => {
    if (isPublicAuthPath(pathname)) return;

    if (platformStatus === "authenticated" && nestToken) {
      setNestSessionCookie(nestToken);
    }
  }, [platformStatus, nestToken, pathname]);

  useEffect(() => {
    if (!isFacebookAdsPath(pathname)) return;

    const hasFbToken = !!useAuthStore.getState().facebook.profile?.tokenSet?.eaag;
    if (fbStatus === "ok" && fbUid && hasFbToken) {
      setFbSessionCookie(fbUid);
      return;
    }
    clearFbSessionCookie();
  }, [fbStatus, fbUid, pathname]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORE_KEY) return;

      const rehydrate = async () => {
        await safeRehydrateAuthStore();
        const currentPath = window.location.pathname;
        if (isPublicAuthPath(currentPath)) return;

        const store = useAuthStore.getState();
        if (!store.platform.nestToken) {
          redirectToSignIn(router, currentPath);
          return;
        }

        setNestSessionCookie(store.platform.nestToken);

        if (isFacebookAdsPath(currentPath)) {
          await authGuard.checkFacebookAuth();
        }
      };

      void rehydrate();
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  if (!isPublicAuthPath(pathname) && !authBootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Đang khởi tạo phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}