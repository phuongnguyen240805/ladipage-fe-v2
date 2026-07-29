import { afterEach, describe, expect, it, vi } from "vitest";

import { landingApiFetch } from "./landing-api-client";

describe("landingApiFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retries a transient network failure for GET requests", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ domains: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    await expect(
      landingApiFetch<{ domains: unknown[] }>("/api/landing-pages/domains"),
    ).resolves.toEqual({ domains: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry mutating requests", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      landingApiFetch("/api/landing-pages/tags", { method: "POST" }),
    ).rejects.toThrow("Failed to fetch");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("preserves Headers supplied by the caller", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await landingApiFetch("/api/landing-pages/tags", {
      headers: new Headers({ "X-Request-Source": "landing-page" }),
    });

    const requestInit = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(requestInit?.headers).get("X-Request-Source")).toBe(
      "landing-page",
    );
  });
});
