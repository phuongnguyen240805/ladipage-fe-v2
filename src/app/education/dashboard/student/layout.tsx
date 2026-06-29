"use client";

import React from "react";
import StudentHeader from "@/features/education/layout/StudentHeader";
import StudentSidebar from "@/features/education/layout/StudentNavbar";
import { SidebarProvider, useSidebar } from "@/features/education/context/SidebarContext";

// Tạo một component wrapper bên trong Provider để có thể sử dụng hook useSidebar
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  const isOpen = isExpanded || isHovered;

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50 dark:bg-slate-950 overflow-x-hidden">
      
      {/* 1. THANH MENU BÊN TRÁI (Cố định w-[290px] hoặc w-[78px]) */}
      <StudentSidebar />

      {/* 2. KHỐI NỘI DUNG BÊN PHẢI (Chứa cả Header và Content) */}
      {/* SỬA: Đồng bộ padding-left chính xác theo trạng thái co/giãn của Sidebar giống như Header */}
      <div 
        className={`flex flex-1 flex-col min-w-0 w-full transition-all duration-300 ease-in-out
          ${isOpen ? "pl-0 md:pl-[290px]" : "pl-0 md:pl-[78px]"}
        `}
      >
        {/* Header nằm cố định trên cùng */}
        <StudentHeader role="student" />

        {/* NỘI DUNG TRANG CHÍNH */}
        {/* SỬA: Bổ sung min-w-0 và w-full để ép form/card ép buộc phải co nhỏ theo chiều rộng của Main */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 2xl:p-10 pt-[100px] md:pt-[100px] 2xl:pt-[100px]">
          {children}
        </main>
        
      </div>
    </div>
  );
}

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
