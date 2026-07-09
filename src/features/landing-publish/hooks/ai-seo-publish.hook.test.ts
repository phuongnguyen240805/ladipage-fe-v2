import { describe, expect, it } from "vitest";

import {
  buildOttoSeoScriptTag,
  injectOttoSeoScript,
  OTTO_SEO_SDK_BASE,
} from "./ai-seo-publish.hook";

describe("ai-seo-publish.hook", () => {
  it("builds OTTO script tag", () => {
    expect(buildOttoSeoScriptTag("proj-123")).toBe(
      `<script async src="${OTTO_SEO_SDK_BASE}/proj-123.js"></script>`,
    );
  });

  it("injects script before closing head", () => {
    const html = "<!doctype html><html><head><title>x</title></head><body></body></html>";
    const result = injectOttoSeoScript(html, "proj-abc");
    expect(result).toContain("</head>");
    expect(result.indexOf("api.otto-seo.com/sdk/proj-abc.js")).toBeGreaterThan(-1);
    expect((result.match(/api\.otto-seo\.com\/sdk\/proj-abc\.js/g) || []).length).toBe(1);
  });

  it("does not duplicate script on re-publish", () => {
    const html = injectOttoSeoScript("<html><head></head><body></body></html>", "proj-abc");
    const result = injectOttoSeoScript(html, "proj-abc");
    expect((result.match(/api\.otto-seo\.com\/sdk\/proj-abc\.js/g) || []).length).toBe(1);
  });

  it("appends script when head tag is missing", () => {
    const html = "<div>hello</div>";
    const result = injectOttoSeoScript(html, "proj-xyz");
    expect(result.endsWith(buildOttoSeoScriptTag("proj-xyz"))).toBe(true);
  });
});