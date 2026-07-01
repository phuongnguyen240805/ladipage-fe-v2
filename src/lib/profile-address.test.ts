import { describe, expect, it } from "vitest";
import type { AccountInfo } from "@liora/api-types";

function resolveAddress(profile?: AccountInfo | null) {
  return {
    addressCountry: profile?.addressCountry ?? "",
    addressCityState: profile?.addressCityState ?? "",
    postalCode: profile?.postalCode ?? "",
    taxId: profile?.taxId ?? "",
  };
}

describe("profile address fields", () => {
  it("reads address fields from account profile", () => {
    const profile: AccountInfo = {
      username: "demo",
      nickname: "Demo",
      email: "demo@test.com",
      phone: "",
      remark: "",
      avatar: "",
      bio: "",
      socialFacebook: "",
      socialX: "",
      socialLinkedin: "",
      socialInstagram: "",
      addressCountry: "Vietnam",
      addressCityState: "Da Nang",
      postalCode: "550000",
      taxId: "TAX-001",
    };

    expect(resolveAddress(profile)).toEqual({
      addressCountry: "Vietnam",
      addressCityState: "Da Nang",
      postalCode: "550000",
      taxId: "TAX-001",
    });
  });
});