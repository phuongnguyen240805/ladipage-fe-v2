import { describe, expect, it } from "vitest";
import { resolveFacebookAdsEmbedded } from "./useFacebookAdsEmbedContext";

describe("resolveFacebookAdsEmbedded", () => {
  it("keeps the web workspace outside embed mode", () => {
    expect(resolveFacebookAdsEmbedded(false, false)).toBe(false);
  });

  it("uses embed mode for the initial extension URL", () => {
    expect(resolveFacebookAdsEmbedded(true, false)).toBe(true);
  });

  it("keeps embed mode inside an iframe after navigation drops the query", () => {
    expect(resolveFacebookAdsEmbedded(false, true)).toBe(true);
  });
});
