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
  it("omits source and assignee fields rejected by current BE", () => {
    const body = buildCreateOrderRequestBody({
      ...basePayload,
      source: "Landing Page",
      assigneeId: "staff-1",
      assigneeName: "An",
      tagIds: [2],
    });
    expect(body).not.toHaveProperty("source");
    expect(body).not.toHaveProperty("assigneeId");
    expect(body).not.toHaveProperty("assigneeName");
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