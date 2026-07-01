import { describe, expect, it } from "vitest";
import { PlatformAuthService } from "./services/platform-auth.service";

describe("PlatformAuthService.validatePassword", () => {
  const service = new PlatformAuthService();

  it("accepts passwords matching BE rules", () => {
    expect(service.validatePassword("SmokeTest123!")).toBeNull();
    expect(service.validatePassword("Abcdef1")).toBeNull();
  });

  it("rejects passwords that are too short, lack digits, or exceed max length", () => {
    expect(service.validatePassword("Ab1")).not.toBeNull();
    expect(service.validatePassword("NoDigitsHere")).not.toBeNull();
    expect(service.validatePassword("A".repeat(17) + "1")).not.toBeNull();
  });
});