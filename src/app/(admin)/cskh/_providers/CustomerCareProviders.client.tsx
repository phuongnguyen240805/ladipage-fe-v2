"use client";

import { useEffect, type ReactNode } from "react";
import { installCustomerCareAuthBoundary } from "@/features/customer-care/session/customer-care-auth-boundary";
import { appQueryClient } from "@/lib/query-client";

export function CustomerCareProviders({ children }: { children: ReactNode }) {
  useEffect(() => installCustomerCareAuthBoundary(appQueryClient), []);
  return children;
}
