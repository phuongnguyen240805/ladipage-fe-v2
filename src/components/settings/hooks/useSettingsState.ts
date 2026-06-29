"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useFacebookAuth } from "@/features/auth/hooks/useFacebookAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import type { FacebookTokenSet } from "@/features/auth/types";
import {
  EMPTY_TOKEN_VALUES,
  HIDDEN_TOKEN_FIELDS,
  THEME_STORAGE_KEY,
  TOKEN_STORAGE_KEYS,
} from "../constants";
import { readFacebookAuthRecord, readSettingValue, saveSettingValue } from "../storage";
import {
  isMockCookie,
  isMockToken,
  normalizeTokenResult,
  sanitizeCookie,
  sanitizeToken,
  sanitizeTokenSet,
} from "../token-refresh";
import type { FacebookTokenValues, ThemePreference } from "../types";

export function useSettingsState() {
  const { theme, toggleTheme } = useTheme();
  const { refreshTokens, syncCookie } = useFacebookAuth();
  const profile = useAuthStore((state) => state.facebook.profile);
  const updateTokens = useAuthStore((state) => state.updateTokens);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [tokenValues, setTokenValues] = useState<FacebookTokenValues>(EMPTY_TOKEN_VALUES);
  const [visibleTokenFields, setVisibleTokenFields] = useState(HIDDEN_TOKEN_FIELDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const storedProfileValues = useMemo<FacebookTokenValues>(
    () => ({
      eaag: sanitizeToken(profile?.tokenSet?.eaag),
      eaab: sanitizeToken(profile?.tokenSet?.eaab),
      eaai: sanitizeToken(profile?.tokenSet?.eaai),
      eaah: sanitizeToken(profile?.tokenSet?.eaah),
      cookie: sanitizeCookie(profile?.cookie),
    }),
    [profile]
  );

  useEffect(() => {
    const syncSettingsFromStorage = async () => {
      const savedThemePreference = (await readSettingValue(THEME_STORAGE_KEY)) as ThemePreference;
      setThemePreference(savedThemePreference || "system");

      const rawSavedTokenValues = {
        eaag: await readSettingValue(TOKEN_STORAGE_KEYS.eaag),
        eaab: await readSettingValue(TOKEN_STORAGE_KEYS.eaab),
        eaai: await readSettingValue(TOKEN_STORAGE_KEYS.eaai),
        eaah: await readSettingValue(TOKEN_STORAGE_KEYS.eaah),
        cookie: await readSettingValue(TOKEN_STORAGE_KEYS.cookie),
      };

      const savedTokenValues = {
        eaag: sanitizeToken(rawSavedTokenValues.eaag),
        eaab: sanitizeToken(rawSavedTokenValues.eaab),
        eaai: sanitizeToken(rawSavedTokenValues.eaai),
        eaah: sanitizeToken(rawSavedTokenValues.eaah),
        cookie: sanitizeCookie(rawSavedTokenValues.cookie),
      };

      const storedFacebookAuth = await readFacebookAuthRecord();
      const indexedDbTokenValues = {
        eaag: sanitizeToken(storedFacebookAuth?.accessToken || storedFacebookAuth?.token),
        eaab: sanitizeToken(storedFacebookAuth?.accessToken2),
        eaai: sanitizeToken(storedFacebookAuth?.accessToken4),
        eaah: sanitizeToken(storedFacebookAuth?.accessToken5),
        cookie: sanitizeCookie(storedFacebookAuth?.cookie || storedFacebookAuth?.cookieText),
      };

      Object.entries(rawSavedTokenValues).forEach(([key, value]) => {
        const shouldClear = key === "cookie" ? isMockCookie(String(value || "")) : isMockToken(String(value || ""));
        if (shouldClear) {
          void saveSettingValue(TOKEN_STORAGE_KEYS[key as keyof FacebookTokenValues], "");
        }
      });

      if (profile && ((profile.tokenSet && Object.values(profile.tokenSet).some(isMockToken)) || isMockCookie(profile.cookie))) {
        setProfile({
          ...profile,
          cookie: sanitizeCookie(profile.cookie),
          tokenSet: profile.tokenSet ? sanitizeTokenSet(profile.tokenSet) : undefined,
        });
      }

      if (storedFacebookAuth && !profile) {
        setProfile({
          uid: storedFacebookAuth.uid || "",
          name: storedFacebookAuth.name || "Facebook User",
          cookie: indexedDbTokenValues.cookie,
          avatarUrl:
            storedFacebookAuth.avatar ||
            (storedFacebookAuth.uid ? `https://graph.facebook.com/${storedFacebookAuth.uid}/picture?type=normal` : ""),
          tokenSet: {
            eaag: indexedDbTokenValues.eaag || undefined,
            eaab: indexedDbTokenValues.eaab || undefined,
            eaai: indexedDbTokenValues.eaai || undefined,
            eaah: indexedDbTokenValues.eaah || undefined,
          },
        });
      }

      setTokenValues({
        eaag: storedProfileValues.eaag || indexedDbTokenValues.eaag || savedTokenValues.eaag,
        eaab: storedProfileValues.eaab || indexedDbTokenValues.eaab || savedTokenValues.eaab,
        eaai: storedProfileValues.eaai || indexedDbTokenValues.eaai || savedTokenValues.eaai,
        eaah: storedProfileValues.eaah || indexedDbTokenValues.eaah || savedTokenValues.eaah,
        cookie: storedProfileValues.cookie || indexedDbTokenValues.cookie || savedTokenValues.cookie,
      });
    };

    const syncTimer = window.setTimeout(syncSettingsFromStorage, 0);
    return () => window.clearTimeout(syncTimer);
  }, [profile, setProfile, storedProfileValues]);

  useEffect(() => {
    if (themePreference !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncThemeWithSystem = (isSystemDark: boolean) => {
      if ((isSystemDark && theme === "light") || (!isSystemDark && theme === "dark")) {
        toggleTheme();
      }
    };

    syncThemeWithSystem(mediaQuery.matches);

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      syncThemeWithSystem(event.matches);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themePreference, theme, toggleTheme]);

  const handleThemePreferenceChange = (preference: ThemePreference) => {
    setThemePreference(preference);
    void saveSettingValue(THEME_STORAGE_KEY, preference);

    if (preference === "light" && theme === "dark") toggleTheme();
    if (preference === "dark" && theme === "light") toggleTheme();
    if (preference === "system") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if ((isSystemDark && theme === "light") || (!isSystemDark && theme === "dark")) {
        toggleTheme();
      }
    }
  };

  const handleTokenChange = (key: keyof FacebookTokenValues, value: string) => {
    const nextValue = key === "cookie" ? sanitizeCookie(value) : sanitizeToken(value);
    setTokenValues((currentValues) => ({ ...currentValues, [key]: nextValue }));
    void saveSettingValue(TOKEN_STORAGE_KEYS[key], nextValue);

    if (key !== "cookie") {
      updateTokens({ [key]: nextValue });
    }
  };

  const toggleTokenVisibility = (key: keyof FacebookTokenValues) => {
    setVisibleTokenFields((currentFields) => ({
      ...currentFields,
      [key]: !currentFields[key],
    }));
  };

  const handleRefreshTokens = async () => {
    setIsRefreshing(true);
    setStatusMessage("Đang tải lại thông tin Facebook...");

    try {
      if (tokenValues.cookie) {
        await syncCookie(tokenValues.cookie);
      }

      let refreshedTokens: FacebookTokenSet = {};

      if (window.ViaFacebookAuthGuard?.refreshAllTokensDirect) {
        refreshedTokens = normalizeTokenResult(await window.ViaFacebookAuthGuard.refreshAllTokensDirect());
      } else if (window.ViaFacebookAuthGuard?.refreshFullTokens) {
        refreshedTokens = normalizeTokenResult(
          await window.ViaFacebookAuthGuard.refreshFullTokens({ forceTokenRefresh: true })
        );
      }

      if (!Object.values(refreshedTokens).some(Boolean)) {
        refreshedTokens = normalizeTokenResult(await refreshTokens());
      }

      refreshedTokens = sanitizeTokenSet(refreshedTokens);
      updateTokens(refreshedTokens);

      const nextTokenValues: FacebookTokenValues = {
        ...tokenValues,
        eaag: refreshedTokens.eaag || sanitizeToken(tokenValues.eaag),
        eaab: refreshedTokens.eaab || sanitizeToken(tokenValues.eaab),
        eaai: refreshedTokens.eaai || sanitizeToken(tokenValues.eaai),
        eaah: refreshedTokens.eaah || sanitizeToken(tokenValues.eaah),
      };

      setTokenValues(nextTokenValues);
      Object.entries(nextTokenValues).forEach(([key, value]) => {
        void saveSettingValue(TOKEN_STORAGE_KEYS[key as keyof FacebookTokenValues], value);
      });

      const refreshedCount = Object.values(refreshedTokens).filter(Boolean).length;
      setStatusMessage(
        refreshedCount > 0
          ? `Đã tải lại ${refreshedCount}/4 token Facebook.`
          : "Chưa lấy được token mới. Kiểm tra cookie hoặc extension Facebook."
      );
    } catch (error) {
      console.error("Không thể tải lại Facebook token:", error);
      setStatusMessage("Không thể tải lại token. Vui lòng kiểm tra extension hoặc cookie Facebook.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    themePreference,
    tokenValues,
    visibleTokenFields,
    isRefreshing,
    statusMessage,
    handleThemePreferenceChange,
    handleTokenChange,
    handleRefreshTokens,
    toggleTokenVisibility,
  };
}
