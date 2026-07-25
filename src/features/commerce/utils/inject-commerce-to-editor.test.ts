import { describe, expect, it } from "vitest";

import { createDefaultPageSettings } from "@/components/landing-pages/editor/types";
import type { LandingCommerceProfile } from "@/features/commerce/types";
import {
  COMMERCE_SYNC_MARKER,
  mergeCommerceBindingsIntoEditorData,
} from "./inject-commerce-to-editor";

describe("mergeCommerceBindingsIntoEditorData", () => {
  it("injects product_card sections for sales bindings", () => {
    const editor = {
      pageId: "p1",
      pageName: "Test",
      sections: [],
      pageSettings: createDefaultPageSettings("Test"),
      schemaVersion: 2,
    };
    const profile: LandingCommerceProfile = {
      pageId: "p1",
      pageName: "Test",
      purpose: "sales",
      commerceEngine: "medusa",
      primaryConversion: "purchase",
      bindings: [
        {
          id: "b1",
          productId: "prod_01SERUM",
          productTitle: "Serum",
          productSku: "S1",
          price: 299000,
          currencyCode: "vnd",
          placement: "product_card",
          ctaMode: "buy_now",
          snapshotAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    const next = mergeCommerceBindingsIntoEditorData(editor, profile);
    expect(next.sections.length).toBe(1);
    expect(next.sections[0].type).toBe("product_card");
    expect(next.sections[0].props?.[COMMERCE_SYNC_MARKER]).toBe(true);
    expect(next.sections[0].props?.commerceProductId).toBe("prod_01SERUM");
  });
});
