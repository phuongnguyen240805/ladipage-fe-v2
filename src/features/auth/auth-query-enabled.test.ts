import { describe, expect, it } from "vitest";
import { selectAuthQueryEnabled } from "./auth-query-enabled";
import { initialPlatformSession } from "./types";

describe("selectAuthQueryEnabled", () => {
  const base = {
    platform: { ...initialPlatformSession },
    platformStatus: "idle" as const,
    authBootstrapped: false,
    facebook: {
      uid: null,
      profile: null,
      status: "not_login" as const,
    },
  };

  it("is false before bootstrap", () => {
    expect(
      selectAuthQueryEnabled({
        ...base,
        authBootstrapped: false,
        platformStatus: "authenticated",
        platform: { ...initialPlatformSession, nestToken: "jwt" },
      })
    ).toBe(false);
  });

  it("is false when unauthenticated", () => {
    expect(
      selectAuthQueryEnabled({
        ...base,
        authBootstrapped: true,
        platformStatus: "unauthenticated",
        platform: { ...initialPlatformSession, nestToken: null },
      })
    ).toBe(false);
  });

  it("is true when bootstrapped, authenticated, and token present", () => {
    expect(
      selectAuthQueryEnabled({
        ...base,
        authBootstrapped: true,
        platformStatus: "authenticated",
        platform: { ...initialPlatformSession, nestToken: "jwt-token" },
      })
    ).toBe(true);
  });
});