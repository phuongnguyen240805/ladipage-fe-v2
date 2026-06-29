/** Checkout session response from POST /billing/subscribe or /billing/embedded */
export interface SubscribeResponseDto {
  session: { id: string };
  clientSecret: string;
}

export interface BillingPortalResponseDto {
  portal: string;
}

export interface SubscribePayload {
  priceId?: string;
  plan?: string;
}