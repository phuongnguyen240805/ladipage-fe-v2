import { beforeEach, describe, expect, it } from "vitest";

import {
  commerceMockStore,
  MOCK_MEDUSA_ORG_ID,
  mockMedusaOrganization,
  mockStoreLinkSeed,
} from "./commerce-mock-store";

describe("commerceMockStore", () => {
  beforeEach(() => {
    commerceMockStore.reset();
  });

  it("seeds Medusa organization from reference shape", () => {
    const org = commerceMockStore.getOrganization();
    expect(org.id).toBe(MOCK_MEDUSA_ORG_ID);
    expect(org.name).toBe("My Organization");
    expect(org.legalName).toBe("My Organization, Inc.");
    expect(org.billingEmail).toBe("billing@example.com");
    expect(org.vatNumber).toBe("DE123456789");
    expect(org.status).toBe("active");
    expect(org.accountHolder).toBe("owner@example.com");
    expect(org.subscription.planId).toBe("plan_01ABC");
    expect(org.members).toHaveLength(3);
    expect(org.members.map((m) => m.email)).toEqual([
      "alice@example.com",
      "bob@example.com",
      "carol@example.com",
    ]);
    expect(mockMedusaOrganization.subscription.plan).toBe("Pro");
  });

  it("maps LadiPage org to sales channel under Medusa org", () => {
    const link = commerceMockStore.getStoreLink();
    expect(link.medusaOrganizationId).toBe(MOCK_MEDUSA_ORG_ID);
    expect(link.salesChannelId).toBe(mockStoreLinkSeed.salesChannelId);
    expect(link.status).toBe("active");
  });

  it("lists seed products on channel", () => {
    const products = commerceMockStore.listProducts();
    expect(products.length).toBeGreaterThanOrEqual(3);
    expect(
      products.every((p) => p.salesChannelId === mockStoreLinkSeed.salesChannelId),
    ).toBe(true);
  });

  it("creates product on channel", () => {
    const created = commerceMockStore.createProduct({
      title: "Test Product UI",
      price: 100000,
      stock: 5,
    });
    expect(created.title).toBe("Test Product UI");
    expect(created.salesChannelId).toBe(mockStoreLinkSeed.salesChannelId);
    expect(commerceMockStore.listProducts().some((p) => p.id === created.id)).toBe(
      true,
    );
  });

  it("lists mock orders with landing attribution", () => {
    const orders = commerceMockStore.listOrders();
    expect(orders.length).toBeGreaterThanOrEqual(1);
    expect(orders[0].landingPageId).toBeTruthy();
  });

  it("role permissions for owner vs viewer", () => {
    commerceMockStore.setRole("owner");
    expect(commerceMockStore.getPermissions()).toContain(
      "commerce:product:write",
    );
    commerceMockStore.setRole("viewer");
    expect(commerceMockStore.getPermissions()).not.toContain(
      "commerce:product:write",
    );
  });
});
