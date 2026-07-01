"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import {
  analyticsApi,
  type ReportDateRange,
} from "@/lib/endpoints/analytics.api";
import { queryKeys } from "@/lib/query-keys";

export function defaultReportRange(): ReportDateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 13);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function useSalesReport(range: ReportDateRange) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.sales(range.from, range.to),
    queryFn: () => analyticsApi.getSalesReport(range),
    enabled,
  });
}

export function useBusinessReport(range: ReportDateRange) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.business(range.from, range.to),
    queryFn: () => analyticsApi.getBusinessReport(range),
    enabled,
  });
}

export function useCustomersReport(range: ReportDateRange) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.customers(range.from, range.to),
    queryFn: () => analyticsApi.getCustomersReport(range),
    enabled,
  });
}

export function useJobsReport(range: ReportDateRange) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ["analytics", "jobs", range.from, range.to] as const,
    queryFn: () => analyticsApi.getJobsReport(range),
    enabled,
  });
}

export function useAutomationReport(range: ReportDateRange) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ["analytics", "automation", range.from, range.to] as const,
    queryFn: () => analyticsApi.getAutomationReport(range),
    enabled,
  });
}