"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
