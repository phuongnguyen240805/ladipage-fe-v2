"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { appQueryClient } from "@/lib/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Application-wide TanStack Query provider for authenticated app surfaces.
 * Feature-specific lifecycle hooks must be installed by the feature layout,
 * not here, so public/auth routes do not pull feature runtimes into startup.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
  );
}
