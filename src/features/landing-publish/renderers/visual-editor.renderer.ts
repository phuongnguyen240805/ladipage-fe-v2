import { createHash } from "crypto";

import { renderLandingPageHtml } from "@/components/landing-pages/editor/core/editor-export-html";
import type { EditorData } from "@/components/landing-pages/editor/types";

import type {
  LandingPageRenderer,
  PageDraftPayload,
  RenderedPageArtifact,
} from "../ports/landing-page-renderer.port";

function checksum(html: string): string {
  return createHash("sha256").update(html, "utf8").digest("hex");
}

function extractMeta(data: EditorData): RenderedPageArtifact["meta"] {
  const settings = data.pageSettings ?? {};
  return {
    title: String(settings.seoTitle || data.pageName || "Landing Page"),
    description: settings.seoDescription
      ? String(settings.seoDescription)
      : undefined,
    ogImage: settings.ogImage ? String(settings.ogImage) : undefined,
  };
}

export class VisualEditorRenderer implements LandingPageRenderer {
  readonly engine = "visual-editor" as const;

  canHandle(draft: PageDraftPayload): boolean {
    return draft.renderEngine === "visual-editor";
  }

  async render(draft: PageDraftPayload): Promise<RenderedPageArtifact> {
    const editorData = {
      ...(draft.editorData as EditorData),
      pageName: draft.pageName,
    } as EditorData;

    const html = renderLandingPageHtml(editorData);
    return {
      html,
      meta: extractMeta(editorData),
      checksum: checksum(html),
    };
  }
}

export const visualEditorRenderer = new VisualEditorRenderer();