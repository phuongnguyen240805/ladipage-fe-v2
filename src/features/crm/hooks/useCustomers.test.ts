import { describe, expect, it } from "vitest";
import type { CreateCustomerPayload } from "@/lib/endpoints/crm.api";

/** Ensures create payload uses BE contract (IDs, not display strings). */
function buildCreatePayload(input: {
  name: string;
  phone: string;
  email?: string;
  status?: "ACTIVE" | "BLOCKED";
  segmentIds?: number[];
  tagIds?: number[];
}): CreateCustomerPayload {
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    status: input.status,
    segmentIds: input.segmentIds,
    tagIds: input.tagIds,
  };
}

describe("CRM create customer payload", () => {
  it("sends segmentIds and tagIds as number arrays", () => {
    const payload = buildCreatePayload({
      name: "Nguyễn Văn A",
      phone: "0901234567",
      segmentIds: [1, 2],
      tagIds: [10],
    });
    expect(payload.segmentIds).toEqual([1, 2]);
    expect(payload.tagIds).toEqual([10]);
    expect(payload).not.toHaveProperty("segment");
    expect(payload).not.toHaveProperty("tags");
  });
});