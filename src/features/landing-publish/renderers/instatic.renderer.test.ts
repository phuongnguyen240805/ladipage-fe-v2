import { describe, expect, it } from "vitest";

import { instaticRenderer } from "./instatic.renderer";

describe("instaticRenderer", () => {
  it("handles instatic engine with html string", () => {
    expect(
      instaticRenderer.canHandle({
        pageId: "p1",
        pageName: "P",
        renderEngine: "instatic",
        editorData: "<html><body>hi</body></html>",
      }),
    ).toBe(true);
  });

  it("renders html artifact", async () => {
    const html = "<!DOCTYPE html><html><body><h1>Hi</h1></body></html>";
    const out = await instaticRenderer.render({
      pageId: "p1",
      pageName: "Demo",
      renderEngine: "instatic",
      editorData: html,
      pageSettings: { seoTitle: "Demo SEO" },
    });
    expect(out.html).toBe(html);
    expect(out.meta.title).toBe("Demo SEO");
    expect(out.checksum).toHaveLength(16);
  });

  it("rejects empty artifact", async () => {
    await expect(
      instaticRenderer.render({
        pageId: "p1",
        pageName: "Demo",
        renderEngine: "instatic",
        editorData: "",
      }),
    ).rejects.toThrow(/missing HTML artifact/i);
  });
});
