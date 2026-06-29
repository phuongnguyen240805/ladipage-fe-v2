"use client";

import { useSidebar } from "@/features/education/context/SidebarContext";
import AppHeader from "@/features/education/layout/AppHeader";
import AppSidebar from "@/features/education/layout/AppSidebar";
import Backdrop from "@/features/education/layout/Backdrop";
import React from "react";

export default function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-muted/30 pt-20 text-foreground">
      <AppSidebar />
      <Backdrop />

      <div className={`transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />

        <main className="mx-auto w-full max-w-none p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
