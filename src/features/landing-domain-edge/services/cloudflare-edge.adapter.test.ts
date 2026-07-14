import { afterEach, describe, expect, it, vi } from "vitest";

import { CloudflareEdgeAdapter } from "./cloudflare-edge.adapter";

describe("CloudflareEdgeAdapter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const route = {
    id: "r1",
    domainId: "d1",
    landingPageId: "p1",
    hostname: "www.shop.vn",
    pathPrefix: "/",
    originSlug: "ban-hang",
    edgeStatus: "pending" as const,
    cloudflareHostnameId: "cf-1",
  };

  it("returns disabled when custom edge flag off", async () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "false");
    const adapter = new CloudflareEdgeAdapter();
    const result = await adapter.syncRoute(route);
    expect(result.edgeSyncStatus).toBe("disabled");
  });

  it("returns pending when flag on but credentials missing", async () => {
    vi.stubEnv("LANDING_CUSTOM_DOMAIN_EDGE_ENABLED", "true");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    vi.stubEnv("CLOUDFLARE_LANDING_ROUTES_KV_ID", "");

    const adapter = new CloudflareEdgeAdapter();
    const result = await adapter.syncRoute(route);
    expect(result.edgeSyncStatus).toBe("pending");
    expect(result.message).toMatch(/KV|credentials|queued/i);
  });
});
