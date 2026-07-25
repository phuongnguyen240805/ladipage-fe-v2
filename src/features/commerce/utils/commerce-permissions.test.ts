import { describe, expect, it } from "vitest";

import {
  canBindPage,
  canManageStore,
  canReadOrders,
  canReadProduct,
  canWriteProduct,
  hasCommercePermission,
  isCommerceMonetizeEnabled,
  permissionsForRole,
} from "./commerce-permissions";

describe("commerce-permissions (M0)", () => {
  it("owner has full commerce permissions", () => {
    const perms = permissionsForRole("owner");
    expect(canWriteProduct(perms)).toBe(true);
    expect(canBindPage(perms)).toBe(true);
    expect(canManageStore(perms)).toBe(true);
    expect(canReadOrders(perms)).toBe(true);
  });

  it("editor can bind page but not write product", () => {
    const perms = permissionsForRole("editor");
    expect(canReadProduct(perms)).toBe(true);
    expect(canBindPage(perms)).toBe(true);
    expect(canWriteProduct(perms)).toBe(false);
    expect(canManageStore(perms)).toBe(false);
  });

  it("viewer is read-only", () => {
    const perms = permissionsForRole("viewer");
    expect(canReadProduct(perms)).toBe(true);
    expect(canReadOrders(perms)).toBe(true);
    expect(canWriteProduct(perms)).toBe(false);
    expect(canBindPage(perms)).toBe(false);
  });

  it("hasCommercePermission checks all required", () => {
    const perms = permissionsForRole("editor");
    expect(
      hasCommercePermission(perms, [
        "commerce:product:read",
        "commerce:page:bind",
      ]),
    ).toBe(true);
    expect(
      hasCommercePermission(perms, [
        "commerce:product:read",
        "commerce:product:write",
      ]),
    ).toBe(false);
  });

  it("monetize is disabled in M0", () => {
    expect(isCommerceMonetizeEnabled()).toBe(false);
  });
});
