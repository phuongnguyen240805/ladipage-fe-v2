import { afterEach, describe, expect, it, vi } from "vitest";

import { resolvePublicUrls } from "./domain-route.service";

describe("resolvePublicUrls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns platform localhost URL when edge disabled", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

    const result = resolvePublicUrls({ slug: "khuyen-mai-tet" });

    expect(result.deliveryMode).toBe("platform");
    expect(result.platformUrl).toBe("http://localhost:3000/p/khuyen-mai-tet");
    expect(result.customPublicUrl).toBeNull();
    expect(result.edgeSyncStatus).toBe("disabled");
  });

  it("returns custom URL when edge enabled and route mapped", () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "true");
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
    expect(result.customPublicUrl).toBe("https://shopabc.com/km-tet");
  });
});