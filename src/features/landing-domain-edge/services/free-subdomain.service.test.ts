import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildFreeSubdomainUrl,
  hostToFreeSubdomainSlug,
  isReservedFreeSubdomainSlug,
  isValidFreeSubdomainSlug,
  normalizeFreeSubdomainSlug,
  pickPublicUrl,
} from "./free-subdomain.service";

describe("free-subdomain.service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("normalizeFreeSubdomainSlug", () => {
    it("lowercases and strips invalid characters", () => {
      expect(normalizeFreeSubdomainSlug("Cafe Ha Noi!")).toBe("cafe-ha-noi");
      expect(normalizeFreeSubdomainSlug("--ban-hang--")).toBe("ban-hang");
    });
  });

  describe("isValidFreeSubdomainSlug / reserved", () => {
    it("accepts simple slugs", () => {
      expect(isValidFreeSubdomainSlug("cafe-ha-noi")).toBe(true);
      expect(isValidFreeSubdomainSlug("ban-hang")).toBe(true);
    });

    it("rejects reserved and invalid", () => {
      expect(isReservedFreeSubdomainSlug("www")).toBe(true);
      expect(isValidFreeSubdomainSlug("www")).toBe(false);
      expect(isValidFreeSubdomainSlug("app")).toBe(false);
      expect(isValidFreeSubdomainSlug("api")).toBe(false);
      expect(isValidFreeSubdomainSlug("")).toBe(false);
      expect(isValidFreeSubdomainSlug("---")).toBe(false);
    });
  });

  describe("buildFreeSubdomainUrl", () => {
    it("returns null when flag off", () => {
      vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "false");
      vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
      expect(buildFreeSubdomainUrl("cafe-ha-noi")).toBeNull();
    });

    it("builds https://{slug}.{base} when enabled", () => {
      vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
      vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
      expect(buildFreeSubdomainUrl("cafe-ha-noi")).toBe("https://cafe-ha-noi.liora.app");
    });

    it("accepts *. prefix on base domain", () => {
      vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
      expect(buildFreeSubdomainUrl("shop", "*.pages.liora.app")).toBe(
        "https://shop.pages.liora.app",
      );
    });

    it("returns null for reserved slug even when enabled", () => {
      vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
      vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
      expect(buildFreeSubdomainUrl("www")).toBeNull();
      expect(buildFreeSubdomainUrl("app")).toBeNull();
    });

    it("returns null when base domain missing", () => {
      vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
      vi.stubEnv("FREE_SITE_DOMAIN", "");
      vi.stubEnv("NEXT_PUBLIC_FREE_SITE_DOMAIN", "");
      expect(buildFreeSubdomainUrl("cafe")).toBeNull();
    });
  });

  describe("hostToFreeSubdomainSlug", () => {
    it("extracts first label under base", () => {
      expect(hostToFreeSubdomainSlug("cafe-ha-noi.liora.app", "liora.app")).toBe(
        "cafe-ha-noi",
      );
    });

    it("returns null for apex, wrong base, multi-level, reserved", () => {
      expect(hostToFreeSubdomainSlug("liora.app", "liora.app")).toBeNull();
      expect(hostToFreeSubdomainSlug("cafe.other.com", "liora.app")).toBeNull();
      expect(hostToFreeSubdomainSlug("a.b.liora.app", "liora.app")).toBeNull();
      expect(hostToFreeSubdomainSlug("www.liora.app", "liora.app")).toBeNull();
      expect(hostToFreeSubdomainSlug("app.liora.app", "liora.app")).toBeNull();
    });

    it("strips port from host", () => {
      expect(hostToFreeSubdomainSlug("cafe.liora.app:443", "liora.app")).toBe("cafe");
    });
  });

  describe("pickPublicUrl", () => {
    it("prefers custom > subdomain > platform", () => {
      expect(
        pickPublicUrl({
          customPublicUrl: "https://shop.vn",
          subdomainUrl: "https://a.liora.app",
          platformUrl: "http://localhost:3000/p/a",
        }),
      ).toBe("https://shop.vn");

      expect(
        pickPublicUrl({
          customPublicUrl: null,
          subdomainUrl: "https://a.liora.app",
          platformUrl: "http://localhost:3000/p/a",
        }),
      ).toBe("https://a.liora.app");

      expect(
        pickPublicUrl({
          customPublicUrl: null,
          subdomainUrl: null,
          platformUrl: "http://localhost:3000/p/a",
        }),
      ).toBe("http://localhost:3000/p/a");
    });
  });
});
