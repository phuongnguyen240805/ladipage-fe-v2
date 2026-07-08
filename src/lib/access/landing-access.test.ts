import { describe, expect, it } from "vitest";
import {
  canApplyTemplate,
  canCreateAiLandingPage,
  canCreateLandingPage,
  canCreateLandingPageWithUsage,
  canUseProTemplate,
  type LandingAccessContext,
} from "./landing-access";

const baseCtx: LandingAccessContext = {
  permissions: ["landing:templates:use_pro"],
  subscriptionTier: "free",
  websiteBuilderInstalled: true,
  websiteBuilderCanOpen: true,
};

describe("landing-access page quota", () => {
  it("manual create is never quota-gated", () => {
    expect(
      canCreateLandingPage({
        ...baseCtx,
        billingUsage: {
          pages: { used: 99, limit: 3 },
          domains: { used: 0, limit: 1 },
          credits: { used: 0, balance: 0, limit: 100 },
          subscriptionTier: "free",
        },
      })
    ).toBe(true);
  });

  it("AI create blocks when used >= per-account limit", () => {
    expect(canCreateLandingPageWithUsage(5, 5)).toBe(false);
    expect(
      canCreateAiLandingPage({
        ...baseCtx,
        aiGenerationUsage: { used: 5, limit: 5 },
      })
    ).toBe(false);
  });

  it("AI create allows when under limit or unlimited", () => {
    expect(
      canCreateAiLandingPage({
        ...baseCtx,
        aiGenerationUsage: { used: 4, limit: 5 },
      })
    ).toBe(true);
    expect(canCreateLandingPageWithUsage(99, -1)).toBe(true);
  });
});

describe("landing-access templates", () => {
  it("free user cannot use pro templates", () => {
    expect(canUseProTemplate(baseCtx)).toBe(false);
    expect(canApplyTemplate(baseCtx, { isPro: true })).toBe(false);
    expect(canApplyTemplate(baseCtx, { price_type: "pro" })).toBe(false);
  });

  it("free user can use free templates", () => {
    expect(canApplyTemplate(baseCtx, { isPro: false, price_type: "free" })).toBe(true);
  });

  it("pro user with permission can use pro templates", () => {
    const proCtx: LandingAccessContext = { ...baseCtx, subscriptionTier: "pro" };
    expect(canUseProTemplate(proCtx)).toBe(true);
    expect(canApplyTemplate(proCtx, { isPro: true })).toBe(true);
  });

  it("pro user without RBAC permission is blocked when permissions are loaded", () => {
    const proCtx: LandingAccessContext = {
      ...baseCtx,
      subscriptionTier: "pro",
      permissions: [],
    };
    expect(canUseProTemplate(proCtx)).toBe(true);
    const proNoPerm: LandingAccessContext = {
      ...baseCtx,
      subscriptionTier: "pro",
      permissions: ["landing:pages:view"],
    };
    expect(canUseProTemplate(proNoPerm)).toBe(false);
  });
});