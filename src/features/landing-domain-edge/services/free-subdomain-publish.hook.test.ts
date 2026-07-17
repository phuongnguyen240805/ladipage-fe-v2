import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyFreeSubdomainPublishHook,
  applyFreeSubdomainUnpublishHook,
} from "./free-subdomain-publish.hook";

describe("free-subdomain-publish.hook", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns disabled when flag off", async () => {
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "false");
    vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");

    const result = await applyFreeSubdomainPublishHook({
      slug: "cafe",
      pageId: "page-1",
    });

    expect(result.subdomainUrl).toBeNull();
    expect(result.edgeSyncStatus).toBe("disabled");
    expect(result.skippedReason).toMatch(/LANDING_FREE_SUBDOMAIN_ENABLED/);
  });

  it("returns subdomain URL in proxy mode", async () => {
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
    vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
    vi.stubEnv("FREE_SUBDOMAIN_DELIVERY", "proxy");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.liora.app");

    const result = await applyFreeSubdomainPublishHook({
      slug: "cafe-ha-noi",
      pageId: "page-1",
      html: "<html></html>",
    });

    expect(result.subdomainUrl).toBe("https://cafe-ha-noi.liora.app");
    expect(result.edgeSyncStatus).toBe("disabled");
    expect(result.skippedReason).toBeNull();
  });

  it("marks r2 delivery as pending until upload is wired", async () => {
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
    vi.stubEnv("FREE_SITE_DOMAIN", "liora.app");
    vi.stubEnv("FREE_SUBDOMAIN_DELIVERY", "r2");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.liora.app");

    const result = await applyFreeSubdomainPublishHook({
      slug: "cafe",
      pageId: "page-1",
    });

    expect(result.subdomainUrl).toBe("https://cafe.liora.app");
    expect(result.edgeSyncStatus).toBe("pending");
  });

  it("unpublish proxy mode is a no-op cleanup", async () => {
    vi.stubEnv("LANDING_FREE_SUBDOMAIN_ENABLED", "true");
    vi.stubEnv("FREE_SUBDOMAIN_DELIVERY", "proxy");

    const result = await applyFreeSubdomainUnpublishHook({
      slug: "cafe",
      pageId: "page-1",
    });

    expect(result.cleaned).toBe(true);
  });
});
