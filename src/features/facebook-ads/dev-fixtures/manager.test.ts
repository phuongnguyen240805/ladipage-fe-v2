import { describe, expect, it } from "vitest";
import { getManagerFixture } from "./manager";

describe("facebook ads manager fixtures", () => {
  it("provides the complete AdsMeta-like manager dataset", () => {
    const fixture = getManagerFixture("happy");
    expect(fixture.adAccounts.length).toBeGreaterThan(0);
    expect(fixture.campaigns.some((row) => row.level === "campaign")).toBe(true);
    expect(fixture.campaigns.some((row) => row.level === "adset")).toBe(true);
    expect(fixture.campaigns.some((row) => row.level === "ad")).toBe(true);
  });

  it("does not expose rows in blocked and empty scenarios", () => {
    for (const scenario of ["empty", "disconnected", "permission-denied"] as const) {
      const fixture = getManagerFixture(scenario);
      expect(fixture.adAccounts).toHaveLength(0);
      expect(fixture.campaigns).toHaveLength(0);
    }
  });

  it("keeps usable rows for stale and rate-limited scenarios", () => {
    expect(getManagerFixture("stale").campaigns.length).toBeGreaterThan(0);
    expect(getManagerFixture("rate-limited").campaigns.length).toBeGreaterThan(0);
  });
});

