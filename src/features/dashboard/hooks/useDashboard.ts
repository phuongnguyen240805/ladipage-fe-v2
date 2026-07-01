"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { dashboardApi } from "@/lib/endpoints/dashboard.api";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardSummary() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: dashboardApi.getSummary,
    enabled,
  });
}

export function useDashboardOnboarding() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.dashboard.onboarding,
    queryFn: dashboardApi.getOnboarding,
    enabled,
  });
}
