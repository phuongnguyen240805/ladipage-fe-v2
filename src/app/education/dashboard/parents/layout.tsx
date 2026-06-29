"use client";

import { useSidebar } from "@/features/education/context/SidebarContext";
import AppHeader from "@/features/education/layout/AppHeader";
import AppSidebar from "@/features/education/layout/AppSidebar";
import Backdrop from "@/features/education/layout/Backdrop";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Tính toán khoảng trống (margin) để nội dung không bị Sidebar che mất
  // Cố định 290px khi mở rộng và 90px khi thu nhỏ
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-slate-50 xl:flex dark:bg-slate-950">
      {/* 1. Sidebar bên tay trái */}
      <AppSidebar />

      {/* 2. Lớp phủ khi mở Sidebar trên điện thoại */}
      <Backdrop />

      {/* 3. Vùng nội dung chính bên tay phải */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} pt-[80px]`}
      >
        {/* Thanh Header nằm trên cùng */}
        <AppHeader role="parents" />

        {/* Nội dung chi tiết của từng trang (page.tsx) */}
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
