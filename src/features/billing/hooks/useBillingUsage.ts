"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { billingApi } from "@/lib/endpoints/billing.api";
import { queryKeys } from "@/lib/query-keys";

export function useBillingUsage() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.billing.usage,
    queryFn: billingApi.getUsage,
    enabled,
  });
}