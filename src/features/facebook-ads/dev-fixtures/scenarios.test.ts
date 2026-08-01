import { describe, expect, it } from "vitest";
import {
  FACEBOOK_ADS_SCENARIOS,
  getFacebookAdsScenario,
  isFacebookAdsScenarioId,
} from "./scenarios";

describe("facebook ads fixture scenarios", () => {
  it("keeps scenario ids unique and production-safe", () => {
    const ids = FACEBOOK_ADS_SCENARIOS.map((scenario) => scenario.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FACEBOOK_ADS_SCENARIOS.every((scenario) => scenario.id && scenario.description)).toBe(true);
  });

  it("accepts only allowlisted scenario ids", () => {
    expect(isFacebookAdsScenarioId("happy")).toBe(true);
    expect(isFacebookAdsScenarioId("permission-denied")).toBe(true);
    expect(isFacebookAdsScenarioId("real-meta-write")).toBe(false);
  });

  it("falls back to the happy scenario", () => {
    expect(getFacebookAdsScenario("happy").dataState).toBe("ready");
  });
});

