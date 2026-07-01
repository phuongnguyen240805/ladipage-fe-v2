import type { BlockType } from "@/components/landing-pages/editor/types";

export const LANDING_PREMIUM_BLOCK_TYPES = new Set<BlockType>([
  "funnel_popup",
  "chat_widget",
  "survey",
  "html_code",
  "product_card",
  "collection_list",
]);

export function isPremiumLandingBlock(blockType: BlockType): boolean {
  return LANDING_PREMIUM_BLOCK_TYPES.has(blockType);
}
