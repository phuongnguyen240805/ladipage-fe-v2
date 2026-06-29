import { describe, expect, it, vi } from "vitest";
import { saveBuilderDraft } from "./manual-save";

describe("saveBuilderDraft", () => {
  it("PATCHes the builder page endpoint with the current editor data and session token", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ savedAt: "2026-06-27T10:00:00.000Z" }),
    });
    const editorData = {
      pageId: "page-1",
      pageName: "Manual Save Page",
      sections: [],
      pageSettings: { slug: "manual-save-page" },
      schemaVersion: 2,
    };

    await saveBuilderDraft({
      pageId: "page-1",
      editorData,
      name: "Manual Save Page",
      slug: "manual-save-page",
      sessionToken: "builder-session-token",
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith("/api/builder/pages/page-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-builder-session": "builder-session-token",
      },
      body: JSON.stringify({
        editor_data: editorData,
        name: "Manual Save Page",
        slug: "manual-save-page",
      }),
    });
  });

  it("keeps the caller dirty by throwing when the draft save fails", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Database unavailable" }),
    });

    await expect(
      saveBuilderDraft({
        pageId: "page-1",
        editorData: { sections: [] },
        sessionToken: "builder-session-token",
        fetcher,
      }),
    ).rejects.toThrow("Database unavailable");
  });
});
