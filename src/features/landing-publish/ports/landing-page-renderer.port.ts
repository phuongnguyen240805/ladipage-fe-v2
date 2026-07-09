import type { RenderEngine } from "../types/publish.types";

export interface PageDraftPayload {
  pageId: string;
  renderEngine: RenderEngine;
  editorData?: unknown;
  puckData?: unknown;
  pageName: string;
  pageSettings?: Record<string, unknown>;
  preserveHtml?: boolean;
}

export interface RenderedPageArtifact {
  html: string;
  meta: {
    title: string;
    description?: string;
    ogImage?: string;
  };
  checksum: string;
}

export interface LandingPageRenderer {
  readonly engine: RenderEngine;
  canHandle(draft: PageDraftPayload): boolean;
  render(draft: PageDraftPayload): Promise<RenderedPageArtifact>;
}