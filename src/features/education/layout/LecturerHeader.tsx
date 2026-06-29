"use client";

import React from "react";
import { useSidebar } from "@/features/education/context/SidebarContext";
import { Menu, Search, Bell, Moon, ChevronDown } from "lucide-react";
import Image from "next/image";

export default function LecturerHeader() {
  const { isExpanded, isHovered, toggleMobileSidebar } = useSidebar();
  const isSidebarOpen = isExpanded || isHovered;

  return (
    /* ĐÃ SỬA: Chuyển sang fixed top-0 left-0 right-0 và xử lý padding-left theo Sidebar */
    <header 
      className={`fixed top-0 left-0 right-0 z-40 flex h-[80px] border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900/80
        ${isSidebarOpen ? "pl-[290px]" : "pl-[78px]"}
      `}
    >
      <div className="flex flex-grow items-center justify-between px-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] md:px-6 2xl:px-11 w-full">
        
        {/* Tìm kiếm & nút Mobile */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <button
            onClick={toggleMobileSidebar}
            className="block text-gray-500 hover:text-gray-700 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden sm:block w-full max-w-[360px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm học viên, khóa học, tài liệu..."
              className="w-full rounded-full border border-gray-100 bg-gray-50/50 py-2 pl-11 pr-4 text-xs font-medium text-gray-800 outline-none transition-all focus:border-emerald-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Thông báo & Profile Giảng viên */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-gray-100 pr-4 dark:border-slate-800">
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-900">
              <Moon className="h-4 w-4" />
            </button>

            <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-900">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative h-9 w-9 rounded-full border border-emerald-100 p-0.5 dark:border-emerald-900">
              <Image
                src="/education/images/user/user-01.png" 
                alt="Teacher Avatar"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            </div>
            <div className="hidden text-left lg:block">
              <span className="block text-xs font-bold text-gray-800 dark:text-slate-200">
                ThS. Nguyễn Văn A
              </span>
              <span className="block text-[10px] font-medium text-gray-400 dark:text-slate-500 mt-0.5">
                Giảng viên
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </header>
  );
}