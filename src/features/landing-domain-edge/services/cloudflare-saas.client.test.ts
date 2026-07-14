import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createCustomHostname,
  isCloudflareSaasConfigured,
} from "./cloudflare-saas.client";

describe("cloudflare-saas.client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports not configured without credentials", () => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    expect(isCloudflareSaasConfigured()).toBe(false);
  });

  it("creates local pending hostname without CF credentials", async () => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");

    const record = await createCustomHostname("www.shop.vn");
    expect(record.id).toMatch(/^local-pending-/);
    expect(record.domainStatus).toBe("PENDING");
    expect(record.mappedSslStatus).toBe("PENDING");
    expect(record.hostname).toBe("www.shop.vn");
  });

  it("posts to Cloudflare when credentials present", async () => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "acc-1");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "tok-1");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: {
          id: "cf-host-1",
          hostname: "www.shop.vn",
          status: "pending",
          ssl: { status: "pending_validation" },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const record = await createCustomHostname("www.shop.vn");
    expect(record.id).toBe("cf-host-1");
    expect(record.domainStatus).toBe("PENDING");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/custom_hostnames");
    expect(init.method).toBe("POST");
  });
});
