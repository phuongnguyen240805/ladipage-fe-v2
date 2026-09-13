import { describe, expect, it } from "vitest";
import { getPlatformAuthHeaders, getPlatformAuthToken } from "./platform-auth.client";

describe("platform auth client", () => {
  it("never exposes a platform bearer token to browser code", async () => {
    await expect(getPlatformAuthToken()).resolves.toBeNull();
    await expect(getPlatformAuthToken({ preferNest: true })).resolves.toBeNull();
  });

  it("returns only non-authority headers for same-origin BFF calls", async () => {
    await expect(getPlatformAuthHeaders({ preferNest: true })).resolves.toEqual({
      "Content-Type": "application/json",
    });
  });
});
