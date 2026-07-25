/**
 * Merge commerce bindings into landing EditorData as product_card sections.
 * UI/local only — used after Gắn SP so visual editor shows products.
 */

import {
  createDefaultBlock,
  type EditorBlock,
  type EditorData,
} from "@/components/landing-pages/editor/types";
import { ensureOnlookBlockMeta } from "@/components/landing-pages/editor/types";
import { commerceMockStore } from "@/features/commerce/mock/commerce-mock-store";
import type {
  LandingCommerceProfile,
  PageCommerceBinding,
} from "@/features/commerce/types";
import { formatCommerceMoney } from "@/features/commerce/utils/format-money";

export const COMMERCE_SYNC_MARKER = "commerce_medusa_sync";

function formatPrice(amount: number, currency: string): string {
  return formatCommerceMoney(amount, currency);
}

export function bindingToProductCardSection(
  binding: PageCommerceBinding,
  index: number,
): EditorBlock {
  const product = commerceMockStore
    .listProducts()
    .find((p) => p.id === binding.productId);

  const title = product?.title ?? binding.productTitle;
  const description =
    product?.shortDescription ||
    product?.description ||
    binding.productTitle;
  const image =
    product?.thumbnailUrl ||
    product?.images?.[0] ||
    "/images/product/skincare_product.png";
  const price = formatPrice(
    product?.price ?? binding.price,
    product?.currencyCode ?? binding.currencyCode,
  );
  const oldPrice =
    product?.compareAtPrice != null && product.compareAtPrice > 0
      ? formatPrice(product.compareAtPrice, product.currencyCode)
      : "";
  const badge =
    product?.badge ||
    (binding.ctaMode === "buy_now" ? "Online" : "");
  const ctaText =
    binding.ctaMode === "buy_now"
      ? "MUA NGAY"
      : binding.ctaMode === "add_to_cart"
        ? "THÊM VÀO GIỎ"
        : "XEM CHI TIẾT";

  const gallery = product?.images?.length
    ? product.images
    : image
      ? [image]
      : [];

  const base = createDefaultBlock("product_card");
  const block = ensureOnlookBlockMeta({
    ...base,
    id: `commerce_pc_${binding.productId}_${index}`,
    label: `SP online: ${title}`,
    props: {
      ...base.props,
      title,
      description,
      price,
      oldPrice,
      image: gallery[0] || image,
      badge,
      ctaText,
      bgColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderRadius: 16,
      // commerce metadata (inspector / future runtime)
      commerceProductId: binding.productId,
      commerceBindingId: binding.id,
      commerceSku: product?.sku ?? binding.productSku,
      commerceGallery: gallery,
      commerceHighlights: product?.highlights ?? [],
      commerceBrand: product?.brand ?? "",
      commerceStock: product?.stock ?? 0,
      [COMMERCE_SYNC_MARKER]: true,
    },
  });

  // Wrap as section-friendly: product_card can be section in migration
  return block;
}

export function mergeCommerceBindingsIntoEditorData(
  editorData: EditorData,
  profile: LandingCommerceProfile,
): EditorData {
  const existingSections = editorData.sections ?? [];
  const kept = existingSections.filter((section) => {
    if (section.props?.[COMMERCE_SYNC_MARKER]) return false;
    // also strip nested markers if any
    if (
      section.children?.some((c) => c.props?.[COMMERCE_SYNC_MARKER])
    ) {
      return false;
    }
    return true;
  });

  if (
    profile.purpose === "lead" ||
    profile.purpose === "content" ||
    profile.bindings.length === 0
  ) {
    return {
      ...editorData,
      sections: kept,
      pageSettings: {
        ...editorData.pageSettings,
        commercePurpose: profile.purpose,
        commerceEngine: profile.commerceEngine,
      },
    };
  }

  const commerceSections = profile.bindings.map((b, i) =>
    bindingToProductCardSection(b, i),
  );

  return {
    ...editorData,
    sections: [...kept, ...commerceSections],
    pageSettings: {
      ...editorData.pageSettings,
      commercePurpose: profile.purpose,
      commerceEngine: profile.commerceEngine,
      commerceBindingCount: profile.bindings.length,
    },
  };
}
