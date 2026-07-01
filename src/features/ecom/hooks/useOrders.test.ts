import { describe, expect, it } from "vitest";
import { findOrderIdByCode } from "./useOrders";
import type { OrderItem } from "@/components/sales/dung-chung/types";

describe("findOrderIdByCode", () => {
  const orders: OrderItem[] = [
    {
      id: "42",
      orderId: 42,
      customerName: "A",
      customerPhone: "090",
      productName: "P",
      quantity: 1,
      totalPrice: 100,
      status: "PENDING",
      createdAt: "1/1/2026",
    },
    {
      id: "99",
      orderId: 99,
      customerName: "B",
      customerPhone: "091",
      productName: "Q",
      quantity: 2,
      totalPrice: 200,
      status: "UNPAID",
      createdAt: "2/1/2026",
    },
  ];

  it("resolves numeric orderId from display code", () => {
    expect(findOrderIdByCode(orders, "42")).toBe(42);
    expect(findOrderIdByCode(orders, "99")).toBe(99);
  });

  it("returns null when code is missing", () => {
    expect(findOrderIdByCode(orders, "missing")).toBeNull();
    expect(findOrderIdByCode([], "42")).toBeNull();
  });
});