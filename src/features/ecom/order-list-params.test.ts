import { describe, expect, it } from "vitest";
import { mapOrderStatusFilterToApi } from "./order-list-params";

describe("mapOrderStatusFilterToApi", () => {
  it("returns undefined for ALL and NOT_DELIVERED (client-side filters)", () => {
    expect(mapOrderStatusFilterToApi("ALL")).toBeUndefined();
    expect(mapOrderStatusFilterToApi("NOT_DELIVERED")).toBeUndefined();
  });

  it("passes through server-side status filters", () => {
    expect(mapOrderStatusFilterToApi("PENDING")).toBe("PENDING");
    expect(mapOrderStatusFilterToApi("UNPAID")).toBe("UNPAID");
    expect(mapOrderStatusFilterToApi("SPAM")).toBe("SPAM");
  });
});