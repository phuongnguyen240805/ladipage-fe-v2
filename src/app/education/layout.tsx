"use client";

import React from "react";
import { AuthProvider } from "@/features/education/context/AuthContext";
import { SidebarProvider } from "@/features/education/context/SidebarContext";
import { ThemeProvider } from "@/features/education/context/ThemeContext";
import { Toaster } from "sonner";

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
