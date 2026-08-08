import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  apiDelete: vi.fn(),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock("@/lib/api-client", () => api);

import { adsPlatformRepository } from "./ads-platform.repository";

describe("adsPlatformRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses a fixed provider-neutral API surface", async () => {
    await adsPlatformRepository.listProviders();
    await adsPlatformRepository.listAccounts("connection/id");

    expect(api.apiGet).toHaveBeenNthCalledWith(1, "/ads-platform/providers");
    expect(api.apiGet).toHaveBeenNthCalledWith(
      2,
      "/ads-platform/accounts?connectionId=connection%2Fid",
    );
  });

  it("passes an explicit idempotency key to publish", async () => {
    const input = {
      provider: "META" as const,
      connectionId: "connection-1",
      externalAccountId: "act-1",
      idempotencyKey: "publish:draft-1:revision-2",
      revision: 2,
      draft: { campaign: { name: "Pilot" } },
    };
    await adsPlatformRepository.createPublishJob(input);
    expect(api.apiPost).toHaveBeenCalledWith("/ads-platform/jobs/publish", input);
  });
});
