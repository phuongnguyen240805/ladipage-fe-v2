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
      }),
    ).toBe(false);
  });

  it("is false when unauthenticated", () => {
    expect(
      selectAuthQueryEnabled({
        ...base,
        authBootstrapped: true,
        platformStatus: "unauthenticated",
      }),
    ).toBe(false);
  });

  it("is true when the server-owned session has bootstrapped as authenticated", () => {
    expect(
      selectAuthQueryEnabled({
        ...base,
        authBootstrapped: true,
        platformStatus: "authenticated",
      }),
    ).toBe(true);
  });
});
