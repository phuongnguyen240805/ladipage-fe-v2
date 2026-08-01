import { describe, expect, it } from "vitest";
import { normalizeExtensionAuthSnapshot } from "./extension-auth-bootstrap";

describe("normalizeExtensionAuthSnapshot", () => {
  it("accepts a persisted authenticated session", () => {
    expect(
      normalizeExtensionAuthSnapshot({
        version: 0,
        state: {
          platform: { nestToken: "signed-nest-token", tenant: { tenantId: 1 } },
          platformStatus: "authenticated",
          facebook: { uid: "10001", status: "ok" },
        },
      }),
    ).toMatchObject({
      state: {
        platform: { nestToken: "signed-nest-token" },
        platformStatus: "authenticated",
        facebook: { uid: "10001" },
      },
    });
  });

  it("rejects a snapshot without a platform token", () => {
    expect(
      normalizeExtensionAuthSnapshot({
        state: { platform: { nestToken: "" }, platformStatus: "authenticated" },
      }),
    ).toBeNull();
  });
});
