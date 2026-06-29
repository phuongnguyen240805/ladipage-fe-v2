import { EditorBlock } from "../types";

export interface LandingTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: "section" | "page";
  blocks: Omit<EditorBlock, "id">[];
}

export interface LandingAssetPreset {
  id: string;
  name: string;
  url: string;
  tone: string;
}

export const id = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
export const PRODUCT_ACCENT = "#111827";
export const PRODUCT_ACCENT_SOFT = "#f3f4f6";
export const PRODUCT_BORDER = "#d1d5db";

export const LANDING_ASSETS: LandingAssetPreset[] = [
  {
    id: "cosmetics",
    name: "Cosmetics",
    url: "/images/product/skincare_product.png",
    tone: "Beauty / product",
  },
  {
    id: "wedding",
    name: "Wedding",
    url: "/images/product/wedding_couple.png",
    tone: "Event / romantic",
  },
  {
    id: "tea",
    name: "Herb Tea",
    url: "/images/product/green_tea_product.png",
    tone: "Organic / wellness",
  },
  {
    id: "smartwatch",
    name: "Smartwatch",
    url: "/images/product/smartwatch_product.png",
    tone: "Tech / ecommerce",
  },
];

export function normalizeProductBlock(block: Omit<EditorBlock, "id">): Omit<EditorBlock, "id"> {
  const props = { ...block.props };

  if ("ctaColor" in props) props.ctaColor = props.ctaColor || PRODUCT_ACCENT;
  if ("submitColor" in props) props.submitColor = props.submitColor || PRODUCT_ACCENT;
  if ("accentColor" in props) props.accentColor = props.accentColor || PRODUCT_ACCENT;
  if ("color" in props && block.type === "button") props.color = props.color || PRODUCT_ACCENT;
  if ("textColor" in props && block.type === "button") props.textColor = props.textColor || "#ffffff";
  if ("borderColor" in props) props.borderColor = props.borderColor || PRODUCT_BORDER;
  if ("iconColor" in props) props.iconColor = props.iconColor || PRODUCT_ACCENT;
  if ("iconBg" in props) props.iconBg = props.iconBg || PRODUCT_ACCENT_SOFT;

  if (block.type === "product_card") {
    props.badge = props.badge || "SELECTED";
    props.bgColor = props.bgColor || "#ffffff";
    props.borderColor = props.borderColor || PRODUCT_BORDER;
    props.ctaText = props.ctaText || "Chon mau";
    if (Array.isArray(props.items)) {
      props.items = props.items.map((item: Record<string, unknown>) => ({
        ...item,
        badge: typeof item.badge === "string" && item.badge.length > 0 ? item.badge : "ITEM",
      }));
    }
  }

  if (block.type === "collection_list") {
    props.bgColor = props.bgColor || PRODUCT_ACCENT;
  }

  return {
    ...block,
    props,
  };
}

