import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  incrementTemplateDownloads,
  incrementTemplateViews,
} from "./template-service";

describe("template-service stats", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
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