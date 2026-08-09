import { describe, expect, it } from "vitest";
import {
  buildCreateOrderNotes,
  buildCreateOrderRequestBody,
} from "./create-order-body";
import type { CreateOrderPayload } from "./ecom.api";

const basePayload: CreateOrderPayload = {
  customerName: "Nguyễn Văn A",
  customerPhone: "0901234567",
  items: [{ productName: "Serum", quantity: 1, unitPrice: 350000 }],
};

describe("buildCreateOrderRequestBody", () => {
  it("forwards source, assignee and shipping fields supported by the BE", () => {
    const body = buildCreateOrderRequestBody({
      ...basePayload,
      source: "Landing Page",
      assigneeId: "staff-1",
      assigneeName: "An",
      shippingFee: 32000,
      tagIds: [2],
    });
    expect(body.source).toBe("Landing Page");
    expect(body.assigneeId).toBe("staff-1");
    expect(body.assigneeName).toBe("An");
    expect(body.shippingFee).toBe(32000);
    expect(body.tagIds).toEqual([2]);
  });

  it("folds source and assignee into notes", () => {
    const notes = buildCreateOrderNotes({
      ...basePayload,
      notes: "Giao sớm",
      source: "TikTok Shop",
      assigneeName: "Bình",
    });
    expect(notes).toContain("Giao sớm");
    expect(notes).toContain("Kênh bán: TikTok Shop");
    expect(notes).toContain("NV phụ trách: Bình");
  });
});
