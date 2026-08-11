export interface CustomerCareOrderSourceInput {
  channelProvider?: string | null;
  channel?: string | null;
}

export function buildCustomerCareOrderSource(
  conversation: CustomerCareOrderSourceInput,
): string {
  const provider = String(
    conversation.channelProvider ?? conversation.channel ?? "unknown",
  )
    .trim()
    .toLowerCase();

  return `customer-care:${provider || "unknown"}`;
}
