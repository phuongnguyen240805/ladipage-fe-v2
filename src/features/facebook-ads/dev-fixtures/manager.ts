import type { FacebookAdsScenarioId } from "../contracts/runtime";
import {
  adAccountRows,
  bmRows,
  campaignRows,
  pageRows,
} from "../manager/exact-data";

export function getManagerFixture(scenario: FacebookAdsScenarioId) {
  if (["empty", "disconnected", "permission-denied"].includes(scenario)) {
    return {
      adAccounts: [] as typeof adAccountRows,
      businesses: [] as typeof bmRows,
      pages: [] as typeof pageRows,
      campaigns: [] as typeof campaignRows,
    };
  }

  if (scenario === "partial") {
    return {
      adAccounts: adAccountRows.slice(0, 2),
      businesses: bmRows.slice(0, 2),
      pages: pageRows.slice(0, 2),
      campaigns: campaignRows.slice(0, 5),
    };
  }

  return {
    adAccounts: adAccountRows,
    businesses: bmRows,
    pages: pageRows,
    campaigns: campaignRows,
  };
}

