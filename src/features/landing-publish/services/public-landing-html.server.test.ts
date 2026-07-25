import { describe, expect, it } from "vitest";

import {
  ensureFullHtmlDocument,
  preparePublishedHtmlForDelivery,
  rewriteRootRelativeAssets,
  withEmbedResizeScript,
} from "./public-landing-html.server";

describe("public-landing-html.server", () => {
  it("wraps fragment HTML into a full document", () => {
    const out = ensureFullHtmlDocument('<main id="x">hi</main>');
    expect(out).toContain("<!doctype html>");
    expect(out).toContain("<main id=\"x\">hi</main>");
    expect(out).toContain("</html>");
  });

  it("keeps existing full documents", () => {
    const doc = "<!doctype html><html><body>ok</body></html>";
    expect(ensureFullHtmlDocument(doc)).toBe(doc);
  });

  it("rewrites root-relative media URLs to asset origin", () => {
    const html =
      '<img src="/images/a.png" /><div style="background:url(/images/b.jpg)"></div><a href="/p/x">x</a>';
    const out = rewriteRootRelativeAssets(html, "https://app.example.com");
    expect(out).toContain('src="https://app.example.com/images/a.png"');
    expect(out).toContain("url(https://app.example.com/images/b.jpg)");
    expect(out).toContain('href="https://app.example.com/p/x"');
  });

  it("does not rewrite protocol-relative or absolute URLs", () => {
    const html =
      '<img src="https://cdn.example.com/x.png" /><img src="//cdn.example.com/y.png" />';
    const out = rewriteRootRelativeAssets(html, "https://app.example.com");
    expect(out).toContain('src="https://cdn.example.com/x.png"');
    expect(out).toContain('src="//cdn.example.com/y.png"');
  });

  it("appends embed resize script before </body>", () => {
    const html = "<!doctype html><html><body><p>x</p></body></html>";
    const out = withEmbedResizeScript(html, { id: "page-1" });
    expect(out).toContain("EM_PUBLIC_PAGE_RESIZE");
    expect(out).toContain("page-1");
    expect(out.indexOf("EM_PUBLIC_PAGE_RESIZE")).toBeLessThan(out.indexOf("</body>"));
  });

  it("preparePublishedHtmlForDelivery applies base + embed", () => {
    const html =
      '<!doctype html><html><body><img src="/images/a.png" /></body></html>';
    const out = preparePublishedHtmlForDelivery(html, {
      embed: true,
      pageId: "abc",
      assetBaseUrl: "https://app.liora.app",
    });
    expect(out).toContain("https://app.liora.app/images/a.png");
    expect(out).toContain("EM_PUBLIC_PAGE_RESIZE");
  });
});
