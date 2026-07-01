"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { crmApi, type PagerParams } from "@/lib/endpoints/crm.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiErrorLogToFe } from "@/lib/mappers/crm.mapper";

export function useErrorLogs(params?: PagerParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.errorLogs(params),
    queryFn: async () => {
      const data = await crmApi.listErrorLogs(params);
      return { ...data, items: data.items.map(mapApiErrorLogToFe) };
    },
    enabled,
  });
}