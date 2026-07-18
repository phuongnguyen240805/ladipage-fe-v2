import { describe, expect, it } from "vitest";
import {
  canApplyTemplate,
  canCreateAiLandingPage,
  canCreateDomain,
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

describe("landing-access domains", () => {
  it("blocks free tier regardless of domain quota", () => {
    expect(
      canCreateDomain({
        ...baseCtx,
        subscriptionTier: "free",
        billingUsage: {
          pages: { used: 0, limit: 1 },
          domains: { used: 0, limit: 5 },
          credits: { used: 0, balance: 0, limit: 100 },
          subscriptionTier: "free",
        },
      }),
    ).toBe(false);
  });

  it("blocks create when used >= limit", () => {
    expect(
      canCreateDomain({
        ...baseCtx,
        billingUsage: {
          pages: { used: 0, limit: 1 },
          domains: { used: 0, limit: 0 },
          credits: { used: 0, balance: 0, limit: 100 },
          subscriptionTier: "free",
        },
      }),
    ).toBe(false);
  });

  it("allows create when under limit", () => {
    expect(
      canCreateDomain({
        ...baseCtx,
        permissions: ["landing:domains:manage"],
        subscriptionTier: "pro",
        billingUsage: {
          pages: { used: 0, limit: 10 },
          domains: { used: 2, limit: 10 },
          credits: { used: 0, balance: 0, limit: 100 },
          subscriptionTier: "pro",
        },
      }),
    ).toBe(true);
  });

  it("allows free tier when customer-domain edge test flag is on", () => {
    const prev = process.env.NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED;
    process.env.NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED = "true";
    try {
      expect(
        canCreateDomain({
          ...baseCtx,
          subscriptionTier: "free",
          billingUsage: {
            pages: { used: 0, limit: 1 },
            domains: { used: 0, limit: 0 },
            credits: { used: 0, balance: 0, limit: 100 },
            subscriptionTier: "free",
          },
        }),
      ).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED;
      else process.env.NEXT_PUBLIC_LANDING_CUSTOM_DOMAIN_EDGE_ENABLED = prev;
    }
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