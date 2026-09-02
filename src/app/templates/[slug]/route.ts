import { NextRequest, NextResponse } from "next/server";

import { getPublicLandingTemplateByIdOrSlug } from "@/features/landing-templates/shared/public-template-service";
import {
  ensureFullHtmlDocument,
  rewriteRootRelativeAssets,
  resolveLandingAssetBaseUrl,
} from "@/features/landing-publish/services/public-landing-html.server";

export const runtime = "nodejs";
export const revalidate = 60;

function resolveTemplateArtifactUrls(request: NextRequest, assetPath: string): string[] {
  const urls: string[] = [];
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim().replace(/\/+$/, "");
  if (cdnBase) {
    urls.push(`${cdnBase}/${assetPath.replace(/^\/+/, "")}`);
  }
  urls.push(new URL(assetPath, request.nextUrl.origin).toString());
  return [...new Set(urls)];
}

async function loadTemplateHtml(
  request: NextRequest,
  template: {
    preview_html: string | null;
    published_html: string | null;
    render_url: string | null;
  },
): Promise<string> {
  const inlineHtml = template.preview_html || template.published_html || "";
  if (inlineHtml.trim()) return inlineHtml;
  if (!template.render_url) return "";

  for (const url of resolveTemplateArtifactUrls(request, template.render_url)) {
    try {
      const response = await fetch(url, { cache: "force-cache" });
      if (response.ok) return response.text();
    } catch {
      // Try the next asset origin (CDN -> app origin fallback).
    }
  }

  return "";
}

function withTemplateEmbedResizeScript(
  html: string,
  template: { id: string; slug: string },
): string {
  const script = `
<script>
(function () {
  var templateId = ${JSON.stringify(template.id)};
  var slug = ${JSON.stringify(template.slug)};
  function postHeight() {
    var body = document.body;
    var doc = document.documentElement;
    var height = Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      doc ? doc.clientHeight : 0,
      doc ? doc.scrollHeight : 0,
      doc ? doc.offsetHeight : 0
    );
    parent.postMessage({ type: "EM_TEMPLATE_RESIZE", templateId: templateId, slug: slug, height: height }, "*");
  }
  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);
  if ("ResizeObserver" in window) {
    new ResizeObserver(postHeight).observe(document.documentElement);
  }
  setTimeout(postHeight, 100);
})();
</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${script}</body>`);
  }
  return `${html}${script}`;
}

/**
 * Serve public template preview as standalone HTML (same isolation rules as /p/[slug]).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const template = await getPublicLandingTemplateByIdOrSlug({ slug });

  if (!template) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const html = await loadTemplateHtml(request, template);
  if (!html.trim()) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const embed = request.nextUrl.searchParams.get("embed") === "1";
  let out = ensureFullHtmlDocument(html);
  out = rewriteRootRelativeAssets(out, resolveLandingAssetBaseUrl());
  if (embed) {
    out = withTemplateEmbedResizeScript(out, {
      id: template.id,
      slug: template.slug,
    });
  }

  return new NextResponse(out, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
