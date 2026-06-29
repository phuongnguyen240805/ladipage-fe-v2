"use client";

import React from "react";
import FacebookTokensSection from "./components/FacebookTokensSection";
import ThemePreferenceCard from "./components/ThemePreferenceCard";
import { useSettingsState } from "./hooks/useSettingsState";

export default function Settings() {
  const {
    themePreference,
    tokenValues,
    visibleTokenFields,
    isRefreshing,
    statusMessage,
    handleThemePreferenceChange,
    handleRefreshTokens,
    toggleTokenVisibility,
  } = useSettingsState();

  return (
    <div className="flex w-full flex-col gap-5 text-gray-800 dark:text-gray-200">
      <div className="flex min-h-[550px] w-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-theme-xs dark:bg-[#11121e] dark:border-gray-800 md:p-8">
        <div className="flex flex-col gap-6 text-left">
          <ThemePreferenceCard value={themePreference} onChange={handleThemePreferenceChange} />

          <FacebookTokensSection
            tokenValues={tokenValues}
            visibleTokenFields={visibleTokenFields}
            isRefreshing={isRefreshing}
            statusMessage={statusMessage}
            onRefresh={handleRefreshTokens}
            onToggleVisibility={toggleTokenVisibility}
          />
        </div>
      </div>
    </div>
  );
}
