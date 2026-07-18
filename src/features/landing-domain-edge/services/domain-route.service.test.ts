import { afterEach, describe, expect, it, vi } from "vitest";

import { resolvePublicUrls } from "./domain-route.service";

describe("resolvePublicUrls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns platform localhost URL when free + custom edge disabled", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "false");
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const result = resolvePublicUrls({ slug: "khuyen-mai-tet" });

    expect(result.deliveryMode).toBe("platform");
    expect(result.platformUrl).toBe("http://localhost:3000/p/khuyen-mai-tet");
    expect(result.subdomainUrl).toBeNull();
    expect(result.customPublicUrl).toBeNull();
    expect(result.edgeSyncStatus).toBe("disabled");
  });

  it("returns free subdomain when Plan A enabled", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "false");
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
    vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.liora.app");

    const result = resolvePublicUrls({ slug: "cafe-ha-noi" });

    expect(result.deliveryMode).toBe("subdomain");
    expect(result.platformUrl).toBe("https://app.liora.app/p/cafe-ha-noi");
    expect(result.subdomainUrl).toBe("https://cafe-ha-noi.liora.app");
    expect(result.customPublicUrl).toBeNull();
  });

  it("publicvm free domain: subdomain + custom priority for customer domain test", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "true");
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
    vi.stubEnv("FREE_SITE_DOMAIN", "ladipage.publicvm.com");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const freeOnly = resolvePublicUrls({ slug: "promo" });
    expect(freeOnly.deliveryMode).toBe("subdomain");
    expect(freeOnly.subdomainUrl).toMatch(/promo\.ladipage\.publicvm\.com/);

    const withCustom = resolvePublicUrls({
      slug: "promo",
      route: {
        id: "r1",
        domainId: "d1",
        landingPageId: "p1",
        hostname: "shop.ladipage.publicvm.com",
        pathPrefix: "/",
        originSlug: "promo",
        edgeStatus: "pending",
        cloudflareHostnameId: "local-pending-shop",
      },
    });
    expect(withCustom.deliveryMode).toBe("custom-domain");
    expect(withCustom.customPublicUrl).toBe("https://shop.ladipage.publicvm.com");
    expect(withCustom.subdomainUrl).toMatch(/promo\.ladipage\.publicvm\.com/);
  });

  it("returns custom URL when edge enabled and route mapped (keeps subdomain if any)", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "true");
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
    vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const result = resolvePublicUrls({
      slug: "khuyen-mai-tet",
      context: { domainId: "domain-1", path: "/km-tet" },
      route: {
        id: "route-1",
        domainId: "domain-1",
        landingPageId: "page-1",
        hostname: "shopabc.com",
        pathPrefix: "/km-tet",
        originSlug: "khuyen-mai-tet",
        edgeStatus: "pending",
      },
    });

    expect(result.deliveryMode).toBe("custom-domain");
    expect(result.platformUrl).toBe("http://localhost:3000/p/khuyen-mai-tet");
    // Local origin → free subdomain uses http + :3000 for Host routing
    expect(result.subdomainUrl).toBe("http://khuyen-mai-tet.liora.app:3000");
    expect(result.customPublicUrl).toBe("https://shopabc.com/km-tet");
  });

  it("uses mapped route without explicit domainId in context", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "true");
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.liora.app");

    const result = resolvePublicUrls({
      slug: "ban-hang",
      route: {
        id: "r1",
        domainId: "d1",
        landingPageId: "p1",
        hostname: "www.shop.vn",
        pathPrefix: "/",
        originSlug: "ban-hang",
        edgeStatus: "synced",
      },
    });

    expect(result.deliveryMode).toBe("custom-domain");
    expect(result.customPublicUrl).toBe("https://www.shop.vn");
  });

  it("uses precomputed subdomainUrl when provided", () => {
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const result = resolvePublicUrls({
      slug: "x",
      subdomainUrl: "https://x.liora.app",
    });

    expect(result.deliveryMode).toBe("subdomain");
    expect(result.subdomainUrl).toBe("https://x.liora.app");
  });
});
