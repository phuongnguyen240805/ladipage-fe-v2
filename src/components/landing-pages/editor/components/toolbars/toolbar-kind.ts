import { EditorBlock, BlockType, getNodeKind } from "../../types";

export type ToolbarKind =
  | "section"
  | "text"
  | "image"
  | "button"
  | "group"
  | "block"
  | "html";

const TEXT_BLOCK_TYPES = new Set<BlockType>(["text"]);
const IMAGE_BLOCK_TYPES = new Set<BlockType>(["image"]);
const BUTTON_BLOCK_TYPES = new Set<BlockType>(["button"]);
const GROUP_BLOCK_TYPES = new Set<BlockType>([
  "box",
  "columns",
  "frame",
  "tabs",
  "accordion",
  "carousel",
  "gallery",
  "collection_list",
  "product_card",
  "feature_card",
]);
const HTML_BLOCK_TYPES = new Set<BlockType>(["html_code"]);

const SECTION_BLOCK_TYPES = new Set<BlockType>([
  "hero",
  "product_section",
  "form_section",
  "footer",
  "custom_section",
  "smartwatch_landing",
  "tea_landing",
  "menu",
]);

function matchesKeyword(value: string, keywords: string[]): boolean {
  return keywords.some((kw) => value.includes(kw));
}

export function getToolbarKindFromBlock(block: EditorBlock): ToolbarKind {
  const nodeKind = getNodeKind(block.type, block.kind);
  if (nodeKind === "section" || SECTION_BLOCK_TYPES.has(block.type)) {
    return "section";
  }

  const blockType = String(block.type || "").toLowerCase();
  const blockKind = String(block.kind || "").toLowerCase();
  const componentName = String(block.componentName || "").toLowerCase();
  const label = String(block.label || "").toLowerCase();
  const combined = `${blockType} ${blockKind} ${componentName} ${label}`;

  if (
    TEXT_BLOCK_TYPES.has(block.type) ||
    matchesKeyword(combined, ["text", "heading", "headline", "title", "paragraph", "label", "textblock"])
  ) {
    return "text";
  }

  if (
    IMAGE_BLOCK_TYPES.has(block.type) ||
    matchesKeyword(combined, ["image", "photo", "picture", "img", "imageblock"])
  ) {
    return "image";
  }

  if (
    BUTTON_BLOCK_TYPES.has(block.type) ||
    matchesKeyword(combined, ["button", "cta"]) ||
    (matchesKeyword(combined, ["link"]) && !matchesKeyword(combined, ["collection"]))
  ) {
    return "button";
  }

  if (
    HTML_BLOCK_TYPES.has(block.type) ||
    matchesKeyword(combined, ["html", "embed", "iframe", "htmlcode"])
  ) {
    return "html";
  }

  if (
    nodeKind === "container" ||
    GROUP_BLOCK_TYPES.has(block.type) ||
    matchesKeyword(combined, ["group", "container", "frame", "box", "column"])
  ) {
    return "group";
  }

  return "block";
}

