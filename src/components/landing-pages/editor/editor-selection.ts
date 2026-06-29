import { getToolbarKindFromBlock, type ToolbarKind } from "./components/toolbars/toolbar-kind";
import { EditorBlock } from "./types";

export type EditorSelection =
  | { type: "page" }
  | { type: "section"; sectionId: string }
  | { type: "group"; groupId: string; sectionId?: string }
  | { type: "block"; blockId: string; sectionId?: string; groupId?: string }
  | { type: "text"; blockId: string; sectionId?: string; groupId?: string }
  | { type: "image"; blockId: string; sectionId?: string; groupId?: string }
  | { type: "button"; blockId: string; sectionId?: string; groupId?: string }
  | {
      type: "htmlSubElement";
      htmlBlockId: string;
      elementPath: string;
      role: "text" | "image" | "button" | "container" | "unknown";
    };

function selectionTypeForToolbarKind(
  kind: ToolbarKind,
  block: EditorBlock,
  sectionId?: string,
): EditorSelection {
  const parentSection = sectionId ?? block.parentId ?? undefined;
  const groupId = block.parentId ?? undefined;

  switch (kind) {
    case "section":
      return { type: "section", sectionId: block.id };
    case "text":
      return { type: "text", blockId: block.id, sectionId: parentSection, groupId };
    case "image":
      return { type: "image", blockId: block.id, sectionId: parentSection, groupId };
    case "button":
      return { type: "button", blockId: block.id, sectionId: parentSection, groupId };
    case "group":
      return { type: "group", groupId: block.id, sectionId: parentSection };
    case "html":
    case "block":
    default:
      return { type: "block", blockId: block.id, sectionId: parentSection, groupId };
  }
}

export type InspectorMode =
  | "page"
  | "section"
  | "group"
  | "block"
  | "text"
  | "image"
  | "button"
  | "html"
  | "htmlSubElement";

export type InspectorState = {
  open: boolean;
  mode: InspectorMode;
};

export function findParentSectionId(sections: EditorBlock[], blockId: string): string | undefined {
  for (const section of sections) {
    if (section.id === blockId) return section.id;
    if (section.children?.some((c) => c.id === blockId)) return section.id;
    const walk = (nodes: EditorBlock[], parentSectionId: string): string | undefined => {
      for (const node of nodes) {
        if (node.id === blockId) return parentSectionId;
        if (node.children) {
          const found = walk(node.children, parentSectionId);
          if (found) return found;
        }
      }
      return undefined;
    };
    const found = walk(section.children ?? [], section.id);
    if (found) return found;
  }
  return undefined;
}

export function selectionFromBlock(block: EditorBlock, sectionId?: string): EditorSelection {
  const toolbarKind = getToolbarKindFromBlock(block);
  return selectionTypeForToolbarKind(toolbarKind, block, sectionId);
}

export function selectionFromBlockId(
  id: string | null,
  sections: EditorBlock[],
): EditorSelection {
  if (!id) return { type: "page" };
  const block = findBlockInSections(sections, id);
  if (!block) return { type: "page" };
  const sectionId = findParentSectionId(sections, id);
  return selectionFromBlock(block, sectionId);
}

export function findBlockInSections(sections: EditorBlock[], id: string): EditorBlock | null {
  for (const section of sections) {
    if (section.id === id) return section;
    const walk = (nodes: EditorBlock[]): EditorBlock | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = walk(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const found = walk(section.children ?? []);
    if (found) return found;
  }
  return null;
}

export function getSelectedBlockId(selection: EditorSelection): string | null {
  switch (selection.type) {
    case "page":
      return null;
    case "section":
      return selection.sectionId;
    case "group":
      return selection.groupId;
    case "block":
    case "text":
    case "image":
    case "button":
      return selection.blockId;
    case "htmlSubElement":
      return selection.htmlBlockId;
    default:
      return null;
  }
}

export function resolveInspectorModeFromSelection(selection: EditorSelection): InspectorMode {
  switch (selection.type) {
    case "page":
      return "page";
    case "section":
      return "section";
    case "group":
      return "group";
    case "block":
      return "block";
    case "text":
      return "text";
    case "image":
      return "image";
    case "button":
      return "button";
    case "htmlSubElement":
      return "htmlSubElement";
    default:
      return "page";
  }
}

export function resolveInspectorModeFromBlock(block: EditorBlock | null): InspectorMode {
  if (!block) return "page";
  const toolbarKind = getToolbarKindFromBlock(block);
  if (toolbarKind === "section") return "section";
  if (toolbarKind === "text") return "text";
  if (toolbarKind === "image") return "image";
  if (toolbarKind === "button") return "button";
  if (toolbarKind === "group") return "group";
  if (toolbarKind === "html") return "html";
  return "block";
}

export function resolveSelectionFromClickTarget(
  target: HTMLElement,
  sections: EditorBlock[],
): EditorSelection | null {
  const blockEl = target.closest("[data-editor-block-id]") as HTMLElement | null;
  if (blockEl?.dataset.editorBlockId) {
    const block = findBlockInSections(sections, blockEl.dataset.editorBlockId);
    if (!block) return null;
    const sectionId = findParentSectionId(sections, block.id);
    return selectionFromBlock(block, sectionId);
  }

  const sectionEl = target.closest("[data-editor-section-id]") as HTMLElement | null;
  if (sectionEl?.dataset.editorSectionId) {
    return { type: "section", sectionId: sectionEl.dataset.editorSectionId };
  }

  return null;
}

export function getSelectionDomId(selection: EditorSelection): string | null {
  switch (selection.type) {
    case "page":
      return null;
    case "section":
      return selection.sectionId;
    case "group":
      return selection.groupId;
    case "block":
    case "text":
    case "image":
    case "button":
      return selection.blockId;
    case "htmlSubElement":
      return selection.htmlBlockId;
    default:
      return null;
  }
}

export function getSelectionOutlineLabel(selection: EditorSelection, block: EditorBlock | null): string {
  if (!block) return "PAGE";
  const shortId = block.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  switch (selection.type) {
    case "section":
      return `SECTION${shortId}`;
    case "group":
      return `GROUP${shortId}`;
    case "text":
      return `TEXT${shortId}`;
    case "image":
      return `IMAGE${shortId}`;
    case "button":
      return `BUTTON${shortId}`;
    case "block":
      if (block.type === "html_code") return `HTML${shortId}`;
      return `BLOCK${shortId}`;
    default:
      return `BLOCK${shortId}`;
  }
}