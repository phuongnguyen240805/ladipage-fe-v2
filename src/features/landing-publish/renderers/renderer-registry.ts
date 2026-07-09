import type { LandingPageRenderer, PageDraftPayload } from "../ports/landing-page-renderer.port";
import type { RenderEngine } from "../types/publish.types";
import { puckRenderer } from "./puck.renderer";
import { visualEditorRenderer } from "./visual-editor.renderer";

const RENDERERS: LandingPageRenderer[] = [visualEditorRenderer, puckRenderer];

export function resolveRenderEngine(value: string | null | undefined): RenderEngine {
  return value === "puck" ? "puck" : "visual-editor";
}

export function resolveRenderer(engine: RenderEngine): LandingPageRenderer {
  const renderer = RENDERERS.find((item) => item.engine === engine);
  if (!renderer) {
    throw new Error(`No renderer registered for engine: ${engine}`);
  }
  return renderer;
}

export function resolveRendererFromPage(page: {
  render_engine?: string | null;
}): LandingPageRenderer {
  return resolveRenderer(resolveRenderEngine(page.render_engine));
}

export function buildDraftPayload(input: {
  pageId: string;
  pageName: string;
  editorData: unknown;
  renderEngine?: string | null;
  preserveHtml?: boolean;
}): PageDraftPayload {
  const renderEngine = resolveRenderEngine(input.renderEngine);
  return {
    pageId: input.pageId,
    pageName: input.pageName,
    editorData: input.editorData,
    renderEngine,
    preserveHtml: input.preserveHtml,
  };
}