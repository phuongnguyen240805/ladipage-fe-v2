import { describe, expect, it } from "vitest";
import {
  DEFAULT_FACEBOOK_ADS_PATH,
  normalizeFacebookAdsPreviewPath,
} from "./preview-routing";

describe("facebook ads preview routing", () => {
  it("allows only registered facebook ads routes", () => {
    expect(normalizeFacebookAdsPreviewPath("connections")).toBe("/facebook-ads/connections");
    expect(normalizeFacebookAdsPreviewPath("/facebook-ads/assets?tab=pixel")).toBe("/facebook-ads/assets");
    expect(normalizeFacebookAdsPreviewPath("/facebook-ads/tools/bulk-rename")).toBe("/facebook-ads/tools/bulk-rename");
  });

  it("fails closed for external and nested unknown routes", () => {
    expect(normalizeFacebookAdsPreviewPath("https://evil.example/settings")).toBe(DEFAULT_FACEBOOK_ADS_PATH);
    expect(normalizeFacebookAdsPreviewPath("/facebook-ads/tools/a/b")).toBe("/facebook-ads/tools");
    expect(normalizeFacebookAdsPreviewPath("/settings")).toBe(DEFAULT_FACEBOOK_ADS_PATH);
  });
});

