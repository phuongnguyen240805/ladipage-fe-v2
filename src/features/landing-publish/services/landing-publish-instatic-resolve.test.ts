import { describe, expect, it } from "vitest";

/**
 * Pure helpers mirrored from landing-publish.service resolution order.
 * Keeps regression coverage without booting Supabase.
 */

function extractHtmlFromUnknown(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return null;
  const obj = data as { html?: unknown; publishedHtml?: unknown };
  if (typeof obj.html === "string" && obj.html.trim()) return obj.html.trim();
  if (typeof obj.publishedHtml === "string" && obj.publishedHtml.trim()) {
    return obj.publishedHtml.trim();
  }
  return null;
}

function looksLikeVisualEditorDraft(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (extractHtmlFromUnknown(data)) return false;
  return (
    Array.isArray(obj.blocks) ||
    Array.isArray(obj.ROOT) ||
    typeof obj.pageName === "string" ||
    "content" in obj
  );
}

function resolveInstaticPublishInput(input: {
  draftOverride?: unknown;
  editorData?: unknown;
  publishedHtml?: string | null;
  artifactHtml?: string | null;
}): { engine: "instatic" | "visual-editor"; editorData: unknown } {
  if (input.artifactHtml?.trim()) {
    return { engine: "instatic", editorData: input.artifactHtml.trim() };
  }
  const fromOverride = extractHtmlFromUnknown(input.draftOverride);
  if (fromOverride) return { engine: "instatic", editorData: fromOverride };
  const fromStored = extractHtmlFromUnknown(input.editorData);
  if (fromStored) return { engine: "instatic", editorData: fromStored };
  if (input.publishedHtml?.trim()) {
    return { engine: "instatic", editorData: input.publishedHtml.trim() };
  }
  if (
    looksLikeVisualEditorDraft(input.draftOverride) ||
    looksLikeVisualEditorDraft(input.editorData)
  ) {
    return {
      engine: "visual-editor",
      editorData: input.draftOverride ?? input.editorData,
    };
  }
  throw new Error("missing HTML artifact");
}

describe("instatic publish resolve (VisualEditor draftOverride bug)", () => {
  it("does not treat VisualEditor draftOverride as HTML; falls back to visual-editor", () => {
    const resolved = resolveInstaticPublishInput({
      draftOverride: { blocks: [{ id: "b1" }], pageName: "Promo" },
      editorData: { blocks: [] },
      artifactHtml: null,
      publishedHtml: null,
    });
    expect(resolved.engine).toBe("visual-editor");
    expect((resolved.editorData as { pageName?: string }).pageName).toBe("Promo");
  });

  it("prefers Nest artifact even when draftOverride is visual draft", () => {
    const html = "<html><body>from-instatic</body></html>";
    const resolved = resolveInstaticPublishInput({
      draftOverride: { blocks: [], pageName: "X" },
      artifactHtml: html,
    });
    expect(resolved.engine).toBe("instatic");
    expect(resolved.editorData).toBe(html);
  });

  it("uses published_html when no artifact and override is not HTML", () => {
    const resolved = resolveInstaticPublishInput({
      draftOverride: { pageName: "Y" },
      publishedHtml: "<html>prev</html>",
      artifactHtml: null,
    });
    expect(resolved.engine).toBe("instatic");
    expect(resolved.editorData).toBe("<html>prev</html>");
  });
});
