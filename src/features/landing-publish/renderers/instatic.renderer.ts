import { createHash } from "node:crypto";

import type { LandingPageRenderer, PageDraftPayload, RenderedPageArtifact } from "../ports/landing-page-renderer.port";

function checksum(html: string): string {
  return createHash("sha256").update(html).digest("hex").slice(0, 16);
}

/**
 * L2 renderer for Instatic-backed pages.
 * Prefer HTML provided by Nest artifact / publish-intent; fallback to draft.editorData string.
 */
export const instaticRenderer: LandingPageRenderer = {
  engine: "instatic",

  canHandle(draft: PageDraftPayload): boolean {
    if (draft.renderEngine !== "instatic") return false;
    if (typeof draft.editorData === "string" && draft.editorData.trim()) return true;
    if (
      draft.editorData &&
      typeof draft.editorData === "object" &&
      "html" in (draft.editorData as object) &&
      typeof (draft.editorData as { html?: unknown }).html === "string"
    ) {
      return true;
    }
    return Boolean(draft.preserveHtml);
  },

  async render(draft: PageDraftPayload): Promise<RenderedPageArtifact> {
    let html = "";
    if (typeof draft.editorData === "string") {
      html = draft.editorData;
    } else if (draft.editorData && typeof draft.editorData === "object") {
      const asObj = draft.editorData as { html?: string; publishedHtml?: string };
      html = asObj.html || asObj.publishedHtml || "";
    }

    if (!html.trim()) {
      throw new Error("Instatic renderer: missing HTML artifact (call landing-cms artifact first).");
    }

    const title =
      (draft.pageSettings?.seoTitle as string | undefined) ||
      draft.pageName ||
      "Landing page";

    return {
      html,
      meta: {
        title,
        description: (draft.pageSettings?.seoDescription as string | undefined) || undefined,
      },
      checksum: checksum(html),
    };
  },
};
