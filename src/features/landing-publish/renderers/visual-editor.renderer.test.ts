import { describe, expect, it } from "vitest";

import type { EditorData } from "@/components/landing-pages/editor/types";
import { createDefaultPageSettings } from "@/components/landing-pages/editor/types";

import { visualEditorRenderer } from "./visual-editor.renderer";

const fixture: EditorData = {
  pageId: "page-1",
  pageName: "Test Landing",
  schemaVersion: 2,
  sections: [
    {
      id: "section-1",
      type: "hero",
      kind: "section",
      props: { title: "Hello" },
      frame: { x: 0, y: 0, width: 1200, height: 400 },
      children: [],
    },
  ],
  pageSettings: {
    ...createDefaultPageSettings("Test Landing"),
    seoTitle: "SEO Title",
    seoDescription: "SEO Description",
  },
};

describe("VisualEditorRenderer", () => {
  it("renders stable checksum for fixture", async () => {
    const first = await visualEditorRenderer.render({
      pageId: "page-1",
      pageName: "Test Landing",
      editorData: fixture,
      renderEngine: "visual-editor",
    });

    const second = await visualEditorRenderer.render({
      pageId: "page-1",
      pageName: "Test Landing",
      editorData: fixture,
      renderEngine: "visual-editor",
    });

    expect(first.checksum).toBe(second.checksum);
    expect(first.html).toContain("<!doctype html>");
    expect(first.html).toContain("SEO Title");
    expect(first.meta.title).toBe("SEO Title");
    expect(first.meta.description).toBe("SEO Description");
  });

  it("returns preserveHtml from html_code block", async () => {
    const preserved = await visualEditorRenderer.render({
      pageId: "page-2",
      pageName: "AI Page",
      renderEngine: "visual-editor",
      editorData: {
        ...fixture,
        sections: [
          {
            id: "html-1",
            type: "html_code",
            kind: "element",
            props: { code: "<html><head></head><body>AI</body></html>", preserveHtml: true },
            frame: { x: 0, y: 0, width: 100, height: 100 },
            children: [],
          },
        ],
      },
    });

    expect(preserved.html).toBe("<html><head></head><body>AI</body></html>");
  });
});