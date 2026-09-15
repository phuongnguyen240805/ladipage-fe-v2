import { describe, expect, it } from "vitest";

import {
  buildCanonicalRouteKvKey,
  buildCustomDomainKvKey,
  resolveEdgeOriginPath,
  resolveFreeSubdomainOriginPath,
  resolveFreeSubdomainSlug,
} from "./landing-edge-worker.stub";

describe("landing-edge-worker.stub", () => {
  it("resolves free subdomain slug from Host", () => {
    expect(resolveFreeSubdomainSlug("cafe-ha-noi.liora.app", "liora.app")).toBe(
      "cafe-ha-noi",
    );
    expect(resolveFreeSubdomainSlug("www.liora.app", "liora.app")).toBeNull();
    expect(resolveFreeSubdomainSlug("liora.app", "liora.app")).toBeNull();
  });

  it("maps free slug to /p path", () => {
    expect(resolveFreeSubdomainOriginPath("cafe")).toBe("/p/cafe");
  });

  it("maps custom route to /p path", () => {
    expect(
      resolveEdgeOriginPath("shop.vn", "/", {
        originSlug: "ban-hang",
        originBaseUrl: "https://app.liora.app",
        landingPageId: "p1",
      }),
    ).toBe("/p/ban-hang");
  });

  it("builds Plan B and canonical Phase 8 KV keys consistently", () => {
    expect(buildCustomDomainKvKey("www.shop.vn", "/")).toBe("www.shop.vn/");
    expect(buildCustomDomainKvKey("www.shop.vn", "/km-tet/")).toBe(
      "www.shop.vn/km-tet",
    );
    expect(buildCanonicalRouteKvKey("www.shop.vn", "/")).toBe(
      "route:www.shop.vn:/",
    );
    expect(buildCanonicalRouteKvKey("www.shop.vn", "/km-tet/")).toBe(
      "route:www.shop.vn:/km-tet",
    );
  });
});
