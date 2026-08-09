"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { installCustomerCareAuthBoundary } from '@/features/customer-care/session/customer-care-auth-boundary'
import { appQueryClient } from '@/lib/query-client'

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => installCustomerCareAuthBoundary(appQueryClient), []);

  return (
    <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
  );
}
