import { describe, expect, it } from "vitest";
import type { AccountInfo } from "@liora/api-types";
import {
  buildProfileUpdatePayload,
  parseProfileRemark,
  resolveProfileFromAccount,
  splitDisplayName,
  joinDisplayName,
  resolveAccountDisplayName,
  resolveAccountInitial,
} from "./profile-meta";

describe("profile-meta", () => {
  it("parses legacy plain remark as bio", () => {
    expect(parseProfileRemark("Team Manager")).toEqual({
      bio: "Team Manager",
      social: { facebook: "", x: "", linkedin: "", instagram: "" },
    });
  });

  it("prefers dedicated account fields over legacy remark", () => {
    const profile: AccountInfo = {
      username: "demo",
      nickname: "Demo User",
      email: "demo@test.com",
      phone: "0901",
      remark: "__LIORA_PROFILE_META__:{\"v\":1,\"bio\":\"Legacy\",\"social\":{\"facebook\":\"https://legacy.fb\"}}",
      avatar: "",
      bio: "From BE",
      socialFacebook: "https://facebook.com/be",
      socialX: "",
      socialLinkedin: "",
      socialInstagram: "",
    };

    expect(resolveProfileFromAccount(profile)).toEqual({
      bio: "From BE",
      social: {
        facebook: "https://facebook.com/be",
        x: "",
        linkedin: "",
        instagram: "",
      },
    });
  });

  it("builds account update payload from profile meta", () => {
    expect(
      buildProfileUpdatePayload({
        nickname: "Demo User",
        email: "demo@test.com",
        phone: "0901",
        bio: "Bio text",
        social: {
          facebook: "https://facebook.com/a",
          x: "https://x.com/a",
          linkedin: "",
          instagram: "https://instagram.com/a",
        },
      })
    ).toEqual({
      nickname: "Demo User",
      email: "demo@test.com",
      phone: "0901",
      bio: "Bio text",
      socialFacebook: "https://facebook.com/a",
      socialX: "https://x.com/a",
      socialLinkedin: "",
      socialInstagram: "https://instagram.com/a",
    });
  });

  it("splits and joins display names", () => {
    expect(splitDisplayName("Musharof Chowdhury")).toEqual({
      firstName: "Musharof",
      lastName: "Chowdhury",
    });
    expect(joinDisplayName("Musharof", "Chowdhury")).toBe("Musharof Chowdhury");
  });

  it("resolves account display name with owner fallback", () => {
    expect(
      resolveAccountDisplayName({
        username: "",
        nickname: "  ",
        email: "owner@ladipage.com",
        phone: "",
        remark: "",
        avatar: "",
        bio: "",
        socialFacebook: "",
        socialX: "",
        socialLinkedin: "",
        socialInstagram: "",
        addressCountry: "",
        addressCityState: "",
        postalCode: "",
        taxId: "",
      }),
    ).toBe("owner");

    expect(resolveAccountDisplayName(null)).toBe("Owner");
    expect(resolveAccountInitial(null)).toBe("O");
  });
});