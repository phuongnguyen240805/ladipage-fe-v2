"use client";

import { ThemeToggleButton } from "@/features/education/components/common/ThemeToggleButton";
import NotificationDropdown from "@/features/education/components/header/NotificationDropdown";
import UserDropdown from "@/features/education/components/header/UserDropdown";
import { useSidebar } from "@/features/education/context/SidebarContext";
import React, { useEffect, useRef } from "react";
import { Search, Command, ChevronsLeft, ChevronsRight, Menu } from "lucide-react";

interface StudentHeaderProps {
  role?: string;
}

export default function StudentHeader({ role = "student" }: StudentHeaderProps) {
  const { isExpanded, isHovered, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSidebarOpen = isExpanded || isHovered;

  // Tái sử dụng phím tắt Ctrl + K / Meta + K kích hoạt nhanh ô tìm kiếm từ Admin
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 flex h-[80px] border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900/80
        ${isSidebarOpen ? "md:pl-[290px]" : "md:pl-[78px]"}
      `}
    >
      {/* Container co giãn linh hoạt chống tràn nội dung */}
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        
        {/* PHẦN TRÁI: ĐIỀU HƯỚNG & Ô TÌM KIẾM */}
        <div className="flex flex-1 items-center gap-6 py-4">
          <button
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-400 md:hidden"
            onClick={toggleMobileSidebar}
            title="Mở menu"
          >
            <Menu size={20} />
          </button>

          <button
            className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-400 md:flex"
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Thu gọn menu" : "Mở rộng menu"}
          >
            {isSidebarOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>

          {/* Ô TÌM KIẾM HỌC VIÊN */}
          <div className="relative hidden w-full max-w-[480px] sm:block">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={16} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm khóa học, lịch học, tài liệu..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pr-16 pl-11 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500 focus:bg-white transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
            />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-gray-400 dark:border-slate-700 dark:bg-slate-800">
              <Command size={9} /> K
            </div>
          </div>
        </div>

        {/* PHẦN PHẢI: UTILS & USER DROPDOWN */}
        <div className="flex items-center gap-3 pl-4 flex-shrink-0">
          <ThemeToggleButton />
          <NotificationDropdown href="/education/dashboard/student/notifications" />
          <div className="h-6 w-[1px] bg-gray-100 dark:bg-slate-800" />
          <UserDropdown role={role} />
        </div>

      </div>
    </header>
  );
}
