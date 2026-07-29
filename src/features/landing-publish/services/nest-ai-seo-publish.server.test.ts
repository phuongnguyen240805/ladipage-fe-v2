import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hostnameFromPublicUrl,
  listNestAiSeoLandingPageIds,
  resolveSeoHostnameForPublish,
  syncNestAiSeoAfterPublish,
} from "./nest-ai-seo-publish.server";

describe("nest-ai-seo-publish.server", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("hostnameFromPublicUrl extracts host", () => {
    expect(hostnameFromPublicUrl("https://www.shop.example.com/p/x")).toBe("shop.example.com");
    expect(hostnameFromPublicUrl("http://localhost:3000/p/demo")).toBe("localhost");
    expect(hostnameFromPublicUrl(null)).toBeNull();
  });

  it("resolveSeoHostnameForPublish uses slug host when public URL is localhost", () => {
    expect(
      resolveSeoHostnameForPublish({
        publicUrl: "http://localhost:3000/p/promo",
        slug: "promo",
      }),
    ).toBe("promo.landing.local");
    expect(
      resolveSeoHostnameForPublish({
        publicUrl: "https://shop.vn/landing",
        slug: "promo",
      }),
    ).toBe("shop.vn");
  });

  it("skips Nest call when auth header missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncNestAiSeoAfterPublish({
      pageId: "p1",
      html: "<html></html>",
      publicUrl: "https://example.com",
      name: "Demo",
      slug: "demo",
      authHeader: null,
    });

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lists landing page ids already linked in the current Nest tenant", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 200,
        data: [
          { id: "seo-1", landingPageId: "p1" },
          { id: "seo-2", landingPageId: null },
          { id: "seo-3", landingPageId: "p3" },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const linked = await listNestAiSeoLandingPageIds("tok");

    expect([...linked ?? []]).toEqual(["p1", "p3"]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: expect.stringContaining("/ai-seo/projects"),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });

  it("does not treat projects as missing when the Nest list fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(listNestAiSeoLandingPageIds("Bearer tok")).resolves.toBeNull();
  });

  it("calls Nest ai-seo-sync and unwraps envelope", async () => {
    const payload = {
      pageId: "p1",
      seoProjectId: "seo-1",
      seoSyncStatus: "ok",
      trafficSyncStatus: "ok",
      scriptsInjected: { seoPixel: true, umami: true },
      autoLinked: true,
      published: true,
      html: "<html><head></head></html>",
      publicUrl: "https://example.com",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, data: payload, message: "success" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncNestAiSeoAfterPublish({
      pageId: "p1",
      html: "<html></html>",
      publicUrl: "https://example.com/landing",
      name: "Landing",
      slug: "landing",
      authHeader: "Bearer tok",
    });

    expect(result?.seoProjectId).toBe("seo-1");
    expect(result?.autoLinked).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/publish/landing-pages/p1/ai-seo-sync"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });

  it("returns null on HTTP error (fail-soft)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => "down",
      }),
    );

    const result = await syncNestAiSeoAfterPublish({
      pageId: "p1",
      html: null,
      publicUrl: null,
      name: "x",
      slug: "x",
      authHeader: "Bearer tok",
    });
    expect(result).toBeNull();
  });

  it("returns null on network error (fail-soft)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await syncNestAiSeoAfterPublish({
      pageId: "p1",
      html: null,
      publicUrl: null,
      name: "x",
      slug: "x",
      authHeader: "Bearer tok",
    });
    expect(result).toBeNull();
  });
});
