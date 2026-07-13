import { describe, expect, it } from "vitest";

import {
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
});
