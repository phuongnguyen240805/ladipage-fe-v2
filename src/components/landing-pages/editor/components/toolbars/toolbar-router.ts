import type { EditorSelection } from "../../editor-selection";
import type { InspectorMode } from "../../inspector-state";
import { EditorBlock } from "../../types";
import { getToolbarKindFromBlock, type ToolbarKind } from "./toolbar-kind";

export type { ToolbarKind };
export { getToolbarKindFromBlock };

export function getToolbarKind(selection: EditorSelection, block: EditorBlock | null): ToolbarKind {
  if (selection.type === "section") return "section";

  if (block?.type === "html_code" && block.props.selectedHtmlElement) {
    const subEl = block.props.selectedHtmlElement as { tag: string };
    const tag = String(subEl.tag || "").toLowerCase();

    if (tag === "img" || tag === "video" || tag === "svg") {
      return "image";
    }
    if (tag === "a" || tag === "button") {
      return "button";
    }
    if (
      tag === "h1" ||
      tag === "h2" ||
      tag === "h3" ||
      tag === "h4" ||
      tag === "h5" ||
      tag === "h6" ||
      tag === "p" ||
      tag === "span" ||
      tag === "li" ||
      tag === "em" ||
      tag === "strong" ||
      tag === "b" ||
      tag === "i" ||
      tag === "u"
    ) {
      return "text";
    }
    if (
      tag === "div" ||
      tag === "section" ||
      tag === "article" ||
      tag === "aside" ||
      tag === "footer" ||
      tag === "header" ||
      tag === "main" ||
      tag === "nav"
    ) {
      return "group";
    }
    return "html";
  }

  if (selection.type === "htmlSubElement") {
    if (selection.role === "text") return "text";
    if (selection.role === "image") return "image";
    if (selection.role === "button") return "button";
    return "html";
  }

  if (selection.type === "text") return "text";
  if (selection.type === "image") return "image";
  if (selection.type === "button") return "button";
  if (selection.type === "group") return "group";

  if (block) return getToolbarKindFromBlock(block);

  return "block";
}

const DEBUG_STORAGE_KEY = "landing-builder:debug-toolbar-router";

export function isToolbarDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
}

export function logToolbarKind(
  selection: EditorSelection,
  block: EditorBlock | null,
  toolbarKind: ToolbarKind,
): void {
  if (!isToolbarDebugEnabled()) return;
  console.log("[toolbar-kind]", {
    selection,
    blockId: block?.id,
    blockType: block?.type,
    blockKind: block?.kind,
    componentName: block?.componentName,
    toolbarKind,
  });
}

export function isTextSelection(selection: EditorSelection, block: EditorBlock | null): boolean {
  return getToolbarKind(selection, block) === "text";
}

export function isImageSelection(selection: EditorSelection, block: EditorBlock | null): boolean {
  return getToolbarKind(selection, block) === "image";
}

export function isButtonSelection(selection: EditorSelection, block: EditorBlock | null): boolean {
  return getToolbarKind(selection, block) === "button";
}

export function isGroupSelection(selection: EditorSelection, block: EditorBlock | null): boolean {
  return getToolbarKind(selection, block) === "group";
}

export function inspectorModeForToolbarKind(kind: ToolbarKind): InspectorMode {
  switch (kind) {
    case "section":
      return "section";
    case "text":
      return "text";
    case "image":
      return "image";
    case "button":
      return "button";
    case "group":
      return "group";
    case "html":
      return "html";
    default:
      return "block";
  }
}