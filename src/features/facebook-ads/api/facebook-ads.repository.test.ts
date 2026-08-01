import { describe, expect, it } from "vitest";
import { facebookAdsRepository } from "./facebook-ads.repository";

describe("facebook ads UI repository", () => {
  it("is explicitly mock-only before backend cutover", () => {
    expect(facebookAdsRepository.mode).toBe("mock");
    expect(facebookAdsRepository.getConnections().length).toBeGreaterThan(0);
    expect(facebookAdsRepository.getAssets().length).toBeGreaterThan(0);
  });

  it("exposes the same manager contract for every UI scenario", () => {
    const ready = facebookAdsRepository.getManagerSnapshot("happy");
    const blocked = facebookAdsRepository.getManagerSnapshot("disconnected");
    expect(Object.keys(ready).sort()).toEqual(Object.keys(blocked).sort());
  });
});

