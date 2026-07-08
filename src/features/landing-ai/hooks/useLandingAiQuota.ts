"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { landingAiApi } from "@/lib/endpoints/landing-ai.api";
import { queryKeys } from "@/lib/query-keys";

export function useLandingAiQuota() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.landingAi.quota,
    queryFn: landingAiApi.getQuota,
    enabled,
    staleTime: 30_000,
  });
}