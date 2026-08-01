import type { FacebookAdsScenarioId } from "../contracts/runtime";
import { mockFacebookAdsAssets } from "../dev-fixtures/assets";
import {
  mockFacebookAdsConnections,
  mockFacebookAdsRequiredScopes,
} from "../dev-fixtures/connections";
import { getManagerFixture } from "../dev-fixtures/manager";

/**
 * UI data boundary for the mock-first phase.
 * Replace this implementation with the Next.js BFF repository without changing page components.
 */
export const facebookAdsRepository = {
  mode: "mock" as const,
  getManagerSnapshot: (scenario: FacebookAdsScenarioId) => getManagerFixture(scenario),
  getConnections: () => mockFacebookAdsConnections,
  getRequiredScopes: () => mockFacebookAdsRequiredScopes,
  getAssets: () => mockFacebookAdsAssets,
};

