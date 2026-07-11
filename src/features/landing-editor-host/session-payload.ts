import type { EditorSessionResponse } from "./types";

/**
 * Nest TransformInterceptor wraps body as { code, message, data }.
 * BFF may forward either the envelope or the unwrapped session.
 */
export function normalizeEditorSessionPayload(
  payload: unknown,
  fallbackPageId?: string,
): EditorSessionResponse {
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<
    string,
    unknown
  >;
  const nested =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null;
  const src =
    nested &&
    ("editPath" in nested || "cmsPath" in nested || "pageId" in nested || "editorUrl" in nested)
      ? nested
      : root;

  const pageId = String(src.pageId ?? fallbackPageId ?? "");
  if (!pageId) {
    throw new Error("Landing CMS session missing pageId.");
  }

  const editPathRaw = src.editPath;
  const editPath =
    typeof editPathRaw === "string" && editPathRaw.trim()
      ? editPathRaw.trim()
      : `/landing-pages/${encodeURIComponent(pageId)}/edit`;

  const cmsPath = typeof src.cmsPath === "string" ? src.cmsPath : "";
  const editorUrl = typeof src.editorUrl === "string" ? src.editorUrl : undefined;
  const sessionToken = typeof src.sessionToken === "string" ? src.sessionToken : "";
  const expiresAt =
    typeof src.expiresAt === "string" ? src.expiresAt : new Date().toISOString();
  const engine = src.engine === "legacy" ? "legacy" : "instatic";

  return {
    pageId,
    editPath,
    cmsPath,
    editorUrl,
    sessionToken,
    expiresAt,
    engine,
  };
}
