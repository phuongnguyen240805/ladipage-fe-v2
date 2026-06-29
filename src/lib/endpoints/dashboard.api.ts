import type { DashboardSummaryDto, OnboardingDto } from "@liora/api-types";
import { apiGet } from "../api-client";

export const dashboardApi = {
  getSummary(): Promise<DashboardSummaryDto> {
    return apiGet<DashboardSummaryDto>("/dashboard/summary");
  },

  getOnboarding(): Promise<OnboardingDto> {
    return apiGet<OnboardingDto>("/dashboard/onboarding");
  },
};