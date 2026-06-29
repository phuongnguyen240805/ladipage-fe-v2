import type {
  BillingPortalResponseDto,
  BillingUsageDto,
  CheckoutSessionStatusDto,
  PlanDto,
  SubscribePayload,
  SubscribeResponseDto,
} from "@liora/api-types";
import { apiGet, apiPost } from "../api-client";

export const billingApi = {
  getPlans(): Promise<PlanDto[]> {
    return apiGet<PlanDto[]>("/plans");
  },

  getUsage(): Promise<BillingUsageDto> {
    return apiGet<BillingUsageDto>("/billing/usage");
  },

  subscribe(payload: SubscribePayload): Promise<SubscribeResponseDto> {
    return apiPost<SubscribeResponseDto>("/billing/subscribe", payload);
  },

  getPortalLink(): Promise<BillingPortalResponseDto> {
    return apiGet<BillingPortalResponseDto>("/billing/portal");
  },

  cancel(): Promise<void> {
    return apiPost<void>("/billing/cancel");
  },

  checkSession(sessionId: string): Promise<CheckoutSessionStatusDto> {
    return apiGet<CheckoutSessionStatusDto>(`/billing/check/${sessionId}`);
  },
};