"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  FacebookAdsRuntime,
  FacebookAdsScenarioId,
  FacebookAdsSurface,
} from "../contracts/runtime";
import {
  DEFAULT_FACEBOOK_ADS_SCENARIO,
  getFacebookAdsScenario,
} from "../dev-fixtures/scenarios";

const DEFAULT_OBSERVED_AT = "2026-08-01T14:59:42.000Z";

const defaultRuntime: FacebookAdsRuntime = {
  surface: "workspace",
  scenario: DEFAULT_FACEBOOK_ADS_SCENARIO,
  connectionStatus: "connected",
  dataState: "ready",
  canPublish: false,
  provenance: {
    source: "fixture",
    label: "Dữ liệu mô phỏng",
    observedAt: DEFAULT_OBSERVED_AT,
  },
};

const FacebookAdsRuntimeContext = createContext<FacebookAdsRuntime>(defaultRuntime);

export function FacebookAdsRuntimeProvider({
  children,
  surface,
  scenario = DEFAULT_FACEBOOK_ADS_SCENARIO,
}: {
  children: ReactNode;
  surface: FacebookAdsSurface;
  scenario?: FacebookAdsScenarioId;
}) {
  const value = useMemo<FacebookAdsRuntime>(() => {
    const selectedScenario = getFacebookAdsScenario(scenario);
    return {
      surface,
      scenario,
      connectionStatus: selectedScenario.connectionStatus,
      dataState: selectedScenario.dataState,
      canPublish: false,
      provenance: {
        source: "fixture",
        label: "Dữ liệu mô phỏng",
        observedAt: DEFAULT_OBSERVED_AT,
        staleAt:
          selectedScenario.dataState === "stale"
            ? "2026-08-01T15:14:42.000Z"
            : undefined,
      },
    };
  }, [scenario, surface]);

  return (
    <FacebookAdsRuntimeContext.Provider value={value}>
      {children}
    </FacebookAdsRuntimeContext.Provider>
  );
}

export function useFacebookAdsRuntime(): FacebookAdsRuntime {
  return useContext(FacebookAdsRuntimeContext);
}

