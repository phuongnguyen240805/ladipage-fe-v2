import { describe, expect, it } from "vitest";
import { normalizeExtensionAuthSnapshot } from "./extension-auth-bootstrap";

describe("normalizeExtensionAuthSnapshot", () => {
  it("extracts only the one-time bridge token and optional Facebook context", () => {
    expect(
      normalizeExtensionAuthSnapshot({
        version: 0,
        state: {
          platform: { nestToken: "signed-nest-token", tenant: { tenantId: 1 } },
          platformStatus: "authenticated",
          facebook: { uid: "10001", status: "ok" },
        },
      }),
    ).toEqual({
      token: "signed-nest-token",
      facebook: { uid: "10001", status: "ok" },
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
