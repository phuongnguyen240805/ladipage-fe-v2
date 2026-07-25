import { beforeEach, describe, expect, it } from "vitest";

import {
  createBindingFromProduct,
  landingCommerceBindingsStore,
} from "./landing-commerce-bindings-store";

describe("landingCommerceBindingsStore", () => {
  beforeEach(() => {
    landingCommerceBindingsStore.reset();
  });

  it("defaults to lead purpose with no bindings", () => {
    const p = landingCommerceBindingsStore.getProfile("page-1", "Demo");
    expect(p.purpose).toBe("lead");
    expect(p.commerceEngine).toBe("none");
    expect(p.bindings).toEqual([]);
  });

  it("saves sales profile with product bindings", () => {
    const bind = createBindingFromProduct({
      productId: "prod_01SERUM",
      productTitle: "Serum",
      productSku: "SKU",
      price: 299000,
      currencyCode: "vnd",
      ctaMode: "buy_now",
    });
    const saved = landingCommerceBindingsStore.saveProfile({
      pageId: "page-sales",
      pageName: "Flash Sale",
      purpose: "sales",
      bindings: [bind],
    });
    expect(saved.commerceEngine).toBe("medusa");
    expect(saved.bindings).toHaveLength(1);
    expect(saved.bindings[0].productId).toBe("prod_01SERUM");
    expect(landingCommerceBindingsStore.getVersion()).toBeGreaterThan(0);
  });

  it("clears bindings when purpose is lead", () => {
    const bind = createBindingFromProduct({
      productId: "p1",
      productTitle: "X",
      productSku: "s",
      price: 1,
      currencyCode: "vnd",
    });
    landingCommerceBindingsStore.saveProfile({
      pageId: "page-2",
      pageName: "P",
      purpose: "sales",
      bindings: [bind],
    });
    const lead = landingCommerceBindingsStore.saveProfile({
      pageId: "page-2",
      pageName: "P",
      purpose: "lead",
      bindings: [bind],
    });
    expect(lead.commerceEngine).toBe("none");
    expect(lead.bindings).toEqual([]);
  });
});
