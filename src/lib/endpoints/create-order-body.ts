import type { CreateOrderPayload } from "./ecom.api";

/** BE whitelist (deployed): no `source`, `assigneeId`, `assigneeName` yet. */
export function buildCreateOrderNotes(payload: CreateOrderPayload): string | undefined {
  const parts: string[] = [];
  if (payload.notes?.trim()) parts.push(payload.notes.trim());
  if (payload.source?.trim()) parts.push(`Kênh bán: ${payload.source.trim()}`);
  if (payload.assigneeName?.trim()) {
    parts.push(`NV phụ trách: ${payload.assigneeName.trim()}`);
  }
  return parts.length > 0 ? parts.join("\n") : undefined;
}

export function buildCreateOrderRequestBody(payload: CreateOrderPayload) {
  const notes = buildCreateOrderNotes(payload);
  return {
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    ...(payload.customerEmail ? { customerEmail: payload.customerEmail } : {}),
    ...(payload.paymentMethod ? { paymentMethod: payload.paymentMethod } : {}),
    ...(notes ? { notes } : {}),
    items: payload.items.map((item) => ({
      productName: item.productName,
      quantity: Math.max(1, item.quantity),
      unitPrice: item.unitPrice,
      ...(item.productId ? { productId: item.productId } : {}),
    })),
    ...(payload.tagIds?.length ? { tagIds: payload.tagIds } : {}),
  };
}