import React from "react";
import { BlockType, createDefaultBlock, EditorBlock } from "../types";
import { renderLandingPageHtml } from "./editor-export-html";

export type FieldSchemaType =
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "select"
  | "toggle"
  | "image"
  | "url"
  | "date"
  | "array"
  | "object";

export interface BlockFieldSchema {
  name: string;
  label: string;
  type: FieldSchemaType;
  options?: Array<{ label: string; value: string }>;
  responsive?: boolean;
}

export interface BlockRegistryEntry<TProps extends Record<string, unknown> = Record<string, unknown>> {
  type: BlockType;
  label: string;
  icon: string;
  defaultProps: TProps;
  fieldSchema: BlockFieldSchema[];
  renderCanvas?: (block: EditorBlock<TProps>) => React.ReactNode;
  renderHtml: (block: EditorBlock<TProps>) => string;
  validate?: (block: EditorBlock<TProps>) => string[];
}

const commonTextFields: BlockFieldSchema[] = [
  { name: "content", label: "Nội dung", type: "textarea" },
  { name: "fontSize", label: "Cỡ chữ", type: "number", responsive: true },
  { name: "color", label: "Màu chữ", type: "color" },
  { name: "textAlign", label: "Căn chữ", type: "select", responsive: true, options: alignOptions() },
];

export const BLOCK_REGISTRY = Object.fromEntries(
  ([
    ["hero", "Hero", "H", [
      { name: "headline", label: "Tiêu đề", type: "textarea" },
      { name: "subheadline", label: "Mô tả", type: "textarea" },
      { name: "ctaText", label: "CTA", type: "text" },
      { name: "ctaUrl", label: "CTA URL", type: "url" },
      { name: "bgImage", label: "Ảnh nền", type: "image" },
      { name: "minHeight", label: "Chiều cao", type: "number", responsive: true },
    ]],
    ["text", "Văn bản", "T", commonTextFields],
    ["image", "Hình ảnh", "IMG", [
      { name: "src", label: "Ảnh", type: "image" },
      { name: "alt", label: "Alt", type: "text" },
      { name: "caption", label: "Chú thích", type: "text" },
      { name: "borderRadius", label: "Bo góc", type: "number", responsive: true },
    ]],
    ["button", "Nút bấm", "B", [
      { name: "label", label: "Nhãn", type: "text" },
      { name: "url", label: "URL", type: "url" },
      { name: "color", label: "Màu nút", type: "color" },
      { name: "textColor", label: "Màu chữ", type: "color" },
      { name: "fullWidth", label: "Full width", type: "toggle", responsive: true },
    ]],
    ["columns", "Columns", "COL", [
      { name: "columns", label: "Số cột", type: "number", responsive: true },
      { name: "gap", label: "Khoảng cách", type: "number", responsive: true },
      { name: "distribution", label: "Tỉ lệ", type: "select", options: distributionOptions(), responsive: true },
    ]],
  ] as const).map(([type, label, icon, fieldSchema]) => {
    const defaults = createDefaultBlock(type).props;
    const entry: BlockRegistryEntry = {
      type,
      label,
      icon,
      defaultProps: defaults,
      fieldSchema: fieldSchema as BlockFieldSchema[],
      renderHtml: (block) => renderLandingPageHtml({
        pageId: "preview",
        pageName: "Preview",
        sections: [block],
        pageSettings: {
          bgColor: "#ffffff",
          maxWidth: 1280,
          fontFamily: "Inter, sans-serif",
          primaryColor: "#65a30d",
          seoTitle: "Preview",
          seoDescription: "",
          canonicalUrl: "",
          slug: "preview",
          customDomain: "",
          pixelId: "",
          sandboxProvider: "local",
          sandboxId: "",
          sandboxPort: 3000,
          sandboxStatus: "local",
          sandboxUrl: "",
          previewPath: "/preview",
          funnelEnabled: false,
          funnelFeatureFlag: "funnelx.welcome_popup",
          funnelTrigger: "immediate",
          funnelTriggerThreshold: 5000,
          funnelFrequency: "session",
          posthogEnabled: false,
          posthogProjectKey: "",
          sessionReplayEnabled: false,
        },
        schemaVersion: 2,
      }),
    };
    return [type, entry];
  }),
) as Partial<Record<BlockType, BlockRegistryEntry>>;

export function getBlockRegistryEntry(blockType: BlockType): BlockRegistryEntry | null {
  return BLOCK_REGISTRY[blockType] ?? null;
}

function alignOptions() {
  return [
    { label: "Trái", value: "left" },
    { label: "Giữa", value: "center" },
    { label: "Phải", value: "right" },
  ];
}

function distributionOptions() {
  return [
    { label: "Đều", value: "equal" },
    { label: "60 / 40", value: "60-40" },
    { label: "40 / 60", value: "40-60" },
    { label: "70 / 30", value: "70-30" },
    { label: "30 / 70", value: "30-70" },
  ];
}
