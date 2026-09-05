import { describe, expect, it } from "vitest";

import { createDefaultPageSettings, type EditorData } from "../types";
import { renderLandingPageHtml } from "./editor-export-html";

function baseData(sections: EditorData["sections"]): EditorData {
  return {
    pageId: "page-1",
    pageName: "Layout Test",
    schemaVersion: 2,
    sections,
    pageSettings: {
      ...createDefaultPageSettings("Layout Test"),
      maxWidth: 1200,
      bgColor: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
  };
}

describe("renderLandingPageHtml layout fidelity", () => {
  it("emits absolute frame CSS for elements and fixed section height", () => {
    const html = renderLandingPageHtml(
      baseData([
        {
          id: "section_1",
          type: "box",
          kind: "section",
          props: { bgColor: "#fff", bgImage: "/images/bg.png", title: "", description: "" },
          frame: { x: 0, y: 0, width: 1200, height: 640, zIndex: 1 },
          children: [
            {
              id: "img_1",
              type: "image",
              kind: "element",
              props: {
                src: "/images/product/green_tea_product.png",
                alt: "Tea",
                caption: "",
                width: "full",
                borderRadius: 8,
                showCaption: false,
                objectFit: "cover",
              },
              frame: { x: 120, y: 80, width: 360, height: 240, zIndex: 2 },
              children: [],
            },
          ],
        },
      ]),
    );

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("#section_1");
    expect(html).toContain("height: 640px");
    expect(html).toContain("overflow: hidden");
    expect(html).toContain("#img_1");
    expect(html).toContain("position: absolute");
    expect(html).toContain("left: 120px");
    expect(html).toContain("top: 80px");
    expect(html).toContain("width: 360px");
    expect(html).toContain("height: 240px");
    expect(html).toContain('src="/images/product/green_tea_product.png"');
    expect(html).toContain("object-fit:cover");
    expect(html).toContain("background-image:url('/images/bg.png')");
    // Must not force height:auto on all images (Tailwind-style break).
    expect(html).not.toMatch(/img\s*\{[^}]*height:\s*auto/i);
  });

  it("returns preserved full HTML for AI/s2c blocks", () => {
    const preserved = "<!doctype html><html><body><h1>AI</h1></body></html>";
    const html = renderLandingPageHtml(
      baseData([
        {
          id: "html_1",
          type: "html_code",
          kind: "element",
          props: { code: preserved, preserveHtml: true, height: 900 },
          frame: { x: 0, y: 0, width: 1200, height: 900 },
          children: [],
        },
      ]),
    );
    expect(html).toBe(preserved);
  });

  it("skips hidden blocks", () => {
    const html = renderLandingPageHtml(
      baseData([
        {
          id: "section_1",
          type: "box",
          kind: "section",
          props: { bgColor: "#fff" },
          frame: { x: 0, y: 0, width: 1200, height: 400, zIndex: 1 },
          children: [
            {
              id: "txt_hidden",
              type: "text",
              kind: "element",
              hidden: true,
              props: { content: "secret", fontSize: 16, color: "#000", textAlign: "left", lineHeight: 1.5, paddingX: 0, paddingY: 0 },
              frame: { x: 0, y: 0, width: 200, height: 40, zIndex: 1 },
              children: [],
            },
          ],
        },
      ]),
    );
    expect(html).not.toContain("secret");
    expect(html).not.toContain("#txt_hidden");
  });
});
