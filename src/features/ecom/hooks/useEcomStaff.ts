"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { ecomApi } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";

export function useEcomStaff() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: queryKeys.ecomStaff.list,
    queryFn: async () => {
      try {
        return await ecomApi.listStaff();
      } catch {
        return { items: [] as { id: string; name: string }[] };
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}