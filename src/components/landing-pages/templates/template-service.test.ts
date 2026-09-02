import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getTemplateById,
  incrementTemplateDownloads,
  incrementTemplateViews,
  listTemplates,
} from "./template-service";

describe("template-service stats", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries a transient network failure when loading templates", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [{ id: "template-1" }] }),
      } as Response);

    const result = listTemplates();
    await vi.runAllTimersAsync();

    await expect(result).resolves.toEqual([{ id: "template-1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent template-list requests", async () => {
    const fetchMock = vi.mocked(fetch);
    let resolveFetch!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const first = listTemplates();
    const second = listTemplates();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ items: [{ id: "template-1" }] }),
    } as Response);

    await expect(Promise.all([first, second])).resolves.toEqual([
      [{ id: "template-1" }],
      [{ id: "template-1" }],
    ]);
  });

  it("loads template detail lazily by id", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "template-1", editor_data: { sections: [] } }),
    } as Response);

    await expect(getTemplateById("template-1")).resolves.toEqual({
      id: "template-1",
      editor_data: { sections: [] },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/detail?id=template-1",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("calls stats API for seed template ids with template_key", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, field: "views", views_count: 4, template_id: "uuid-1" }),
    } as Response);

    const result = await incrementTemplateViews({
      id: "seed-beauty-spa",
      template_key: "beauty-spa",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/stats",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          id: "seed-beauty-spa",
          template_key: "beauty-spa",
          field: "views",
        }),
      }),
    );
    expect(result).toEqual({ ok: true, field: "views", views_count: 4, template_id: "uuid-1" });
  });

  it("surfaces readable API errors", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: "Supabase service role key is missing." }),
    } as Response);

    const result = await incrementTemplateViews({
      id: "62f77327-ed58-4570-9925-3ffd26e0bb21",
      template_key: "beauty-spa",
    });
    expect(result).toBeNull();
  });

  it("returns server counts on success", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, field: "downloads", downloads_count: 12 }),
    } as Response);

    const result = await incrementTemplateDownloads({
      id: "62f77327-ed58-4570-9925-3ffd26e0bb21",
      template_key: "beauty-spa",
    });
    expect(result).toEqual({ ok: true, field: "downloads", downloads_count: 12 });
  });
});
