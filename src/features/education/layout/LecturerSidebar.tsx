"use client";

import { useSidebar } from "@/features/education/context/SidebarContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LecturerNavGroups } from "@/features/education/constants/Lecturer_navigation";

export default function LecturerSidebar() {
  const pathname = usePathname();
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar(); 
  const isOpen = isExpanded || isHovered || isMobileOpen;

  const isActivePath = (path: string) =>
    pathname === path || (path !== "/education/dashboard/lecturer" && pathname.startsWith(`${path}/`));

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out dark:bg-slate-900 dark:border-slate-800 
        ${isOpen ? "w-[290px]" : "w-[78px]"} 
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* 💥 LOGO ĐỒNG BỘ CHIỀU CAO h-[80px] VÀ KÍCH THƯỚC CHUẨN ĐỂ HIỂN THỊ */}
      <div className="h-[80px] border-b border-gray-100 flex items-center justify-center px-4 overflow-hidden dark:border-slate-800 flex-shrink-0">
        <Link href="/education/dashboard/lecturer" className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            /* Khi Sidebar MỞ TO -> Khung chứa 310x88 chuẩn khít logo lớn */
            <div className="relative w-[310px] h-[88px] transition-all duration-300 flex items-center justify-center">
              <Image
                src="/education/images/logo/logo-sidebar-admin-big.png"
                alt="Đại Học Đông Á"
                fill
                priority
                sizes="310px"
                className="object-contain"
              />
            </div>
          ) : (
            /* Khi Sidebar THU NHỎ -> Giữ nguyên icon 36x36 nằm giữa */
            <div className="relative w-9 h-9 transition-all duration-300">
              <Image
                src="/education/images/logo/logo-sidebar-admin-small.png"
                alt="UDA"
                fill
                priority
                sizes="36px"
                className="object-contain"
              />
            </div>
          )}
        </Link>
      </div>

      {/* DANH SÁCH MENU GIẢNG VIÊN */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar overflow-x-hidden">
        {LecturerNavGroups && LecturerNavGroups.map((group, groupIdx) => (
          <div key={group.groupName || groupIdx} className="space-y-1">
            {/* Tên nhóm danh mục */}
            {isOpen ? (
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-wider uppercase px-4 py-1 mt-2 select-none truncate">
                {group.groupName}
              </p>
            ) : (
              groupIdx > 0 && <div className="border-t border-gray-100 dark:border-slate-800/80 my-3 mx-2" />
            )}

            {group.items && group.items.map((item) => {
              const active = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={!isOpen ? item.name : undefined}
                  className={`flex items-center py-3 rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden ${
                    isOpen 
                      ? "justify-between px-4" 
                      : "justify-center px-0"  
                  } ${
                    active
                      ? "bg-emerald-100 text-emerald-700 font-bold shadow-sm dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "text-gray-800 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`flex-shrink-0 transition-colors ${active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-slate-400"}`}>
                      {item.icon}
                    </span>
                    {/* Ẩn / Hiện chữ mượt mà không lấn chiếm không gian */}
                    <span className={`text-[13px] font-medium tracking-wide transition-all duration-200 truncate ${
                      isOpen ? "opacity-100 w-auto static" : "opacity-0 w-0 absolute pointer-events-none"
                    }`}>
                      {item.name}
                    </span>
                  </div>
                  
                  {isOpen && item.badge && (
                    <span className="ml-2 flex flex-shrink-0 items-center gap-2">
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        active
                          ? "bg-emerald-200/70 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {item.badge}
                      </span>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* FOOTER ĐỒNG BỘ */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 overflow-hidden dark:border-slate-800 dark:bg-slate-900/50 flex flex-col items-center justify-center flex-shrink-0">
        <div className="text-center flex flex-col items-center justify-center w-full truncate">
          <p className="text-[12px] font-bold text-gray-800 dark:text-slate-200 tracking-wider">
            {isOpen ? "EMS" : "E"}
          </p>
          {isOpen && <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 text-center truncate">Education Management System</p>}
        </div>
      </div>
    </aside>
  );
}
