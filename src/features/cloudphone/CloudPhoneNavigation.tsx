"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

// --- Header Component ---
export const CloudPhoneHeader: React.FC = () => {
  const { toggleMobileSidebar } = useSidebar();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[999] flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-[#0f1016]">
      {/* Left side: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/cloudphone/cua-hang-cho-thue" className="flex items-center gap-2 select-none">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-sm shadow-orange-500/20">
            MAX
          </div>
          <span className="text-base font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
            <span className="text-amber-500">Max</span>
            <span>CloudPhone</span>
          </span>
        </Link>
      </div>

      {/* Center buttons */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Proxy Button */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); alert("Tính năng Mua Proxy đang được cập nhật!"); }}
          className="flex items-center gap-1.5 rounded-lg bg-[#0091ff] px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-[#0091ff]/20 hover:bg-[#0081f0] transition-all cursor-pointer"
        >
          <span>🚀</span>
          <span>Proxy giá rẻ tốc độ cao</span>
        </a>

        {/* Free Cloud Phone Button */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); alert("Chương trình Nhận Cloud Phone Miễn Phí sẽ bắt đầu sớm!"); }}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-purple-600/20 hover:bg-purple-700 transition-all cursor-pointer"
        >
          <span>🎁</span>
          <span>Nhận Cloud Phone Miễn Phí</span>
        </a>
      </div>

      {/* Right side widgets */}
      <div className="flex items-center gap-3">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 hover:bg-gray-100 cursor-pointer"
          >
            <span className="text-sm">🇻🇳</span>
            <span className="hidden sm:inline">Tiếng Việt</span>
            <svg className={`h-3 w-3 text-gray-400 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-xl border border-gray-100 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-[#11121b]">
              <button onClick={() => setLangOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5">
                <span>🇺🇸</span> English
              </button>
              <button onClick={() => setLangOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5">
                <span>🇻🇳</span> Tiếng Việt
              </button>
            </div>
          )}
        </div>

        {/* Discord */}
        <a
          href="https://discord.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 hover:scale-105 transition-all shadow-sm"
          title="Tham gia Discord"
        >
          <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19.06,8.07C-3.79,42.06-2.27,75.48,8.21,90a105.73,105.73,0,0,0,32,16.2c3.08-4.21,5.7-8.77,7.87-13.62A68.79,68.79,0,0,1,34.56,86c1.15-.84,2.27-1.72,3.34-2.62a75.43,75.43,0,0,0,78.27,0c1.07.9,2.2,1.78,3.34,2.62a68.6,68.6,0,0,1-13.6,6.54,84.07,84.07,0,0,0,7.87,13.62,105.73,105.73,0,0,0,32-16.2C129.66,75.48,131.2,42.06,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
          </svg>
        </a>

        {/* Date/Time widget */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-yellow-200/40 bg-yellow-500/5 px-2.5 py-1 text-xs font-bold text-amber-500">
          <span>📅</span>
          <span>28.05.27</span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 transition">
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {/* User profile widget */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-xs font-extrabold text-slate-800 dark:text-white">thecong2610</span>
            <span className="mt-1 text-[10px] font-bold text-amber-500">0đ</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-xs shadow-sm">
            T
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Sidebar Component ---
export const CloudPhoneSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  const handleAction = (name: string) => {
    alert(`Tính năng "${name}" đang được xây dựng hệ thống!`);
  };

  const sections = [
    {
      title: "Dashboard",
      items: [
        { name: "Cửa hàng cho thuê", path: "/cloudphone/cua-hang-cho-thue", iconColor: "text-amber-500", icon: "M3.75 6.75h16.5M5.25 6.75l1.2 12h11.1l1.2-12M9 10.5h6m-5.25 3h4.5" },
        { name: "Quản lý thiết bị", path: "/cloudphone/quan-ly-thiet-bi", iconColor: "text-indigo-500", icon: "M10.5 1.5h3M8.25 3h7.5A2.25 2.25 0 0118 5.25v13.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 18.75V5.25A2.25 2.25 0 018.25 3zm2.25 15h3" },
        { name: "Điều khiển đồng bộ", path: "/cloudphone/dieu-khien-dong-bo", iconColor: "text-teal-500", icon: "M4.5 12a7.5 7.5 0 0112.8-5.303M19.5 12a7.5 7.5 0 01-12.8 5.303M16.5 3.75h1.5v4.5h-4.5M7.5 20.25H6v-4.5h4.5" },
        { name: "Nạp Tiền", path: "#", action: () => handleAction("Nạp Tiền"), iconColor: "text-emerald-500", icon: "M12 6v12m-3-2.818.879.11A3 3 0 0014 12.5v-1a3 3 0 00-2.121-2.818M12 6a3 3 0 00-2.121 2.818" },
        { name: "Tiếp thị liên kết", path: "#", action: () => handleAction("Tiếp thị liên kết"), iconColor: "text-blue-500", icon: "M13.186 1.25c.296.282.525.654.642 1.096L15 8.25h4.5a2.25 2.25 0 012.25 2.25c0 .351-.082.684-.229.98l-3.642 7.284a2.25 2.25 0 01-2.012 1.236H6.133a2.25 2.25 0 01-2.012-1.236L.479 11.48a2.25 2.25 0 01-.23-.98 2.25 2.25 0 012.25-2.25H7L8.172 2.346c.117-.442.346-.814.642-1.096A3 3 0 0110.938.75h1.309c.348 0 .684.17 1 .5z" },
        { name: "Quà tặng", path: "#", action: () => handleAction("Quà tặng"), iconColor: "text-rose-500", icon: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 3v18m0-18l-3 3m3-3l3 3", badge: "HOT" },
        { name: "Vòng quay may mắn", path: "#", action: () => handleAction("Vòng quay may mắn"), iconColor: "text-amber-500", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", badge: "HOT" },
        { name: "Document", path: "#", action: () => handleAction("Document"), iconColor: "text-sky-500", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" },
      ]
    },
    {
      title: "Social Automation",
      items: [
        { name: "Đăng ký dịch vụ", path: "#", action: () => handleAction("Đăng ký dịch vụ"), iconColor: "text-indigo-500", icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" },
        { name: "Gói Phần Mềm Dùng Thử", path: "#", action: () => handleAction("Gói Phần Mềm Dùng Thử"), iconColor: "text-purple-500", icon: "M9.75 3.104v11.851c0 .702.738 1.14 1.35.79l6.3-3.6c.612-.35.612-1.23 0-1.58l-6.3-3.6c-.612-.35-1.35.088-1.35.79z", badge: "HOT" },
        { name: "Quản lý dịch vụ", path: "#", action: () => handleAction("Quản lý dịch vụ"), iconColor: "text-slate-500", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" },
        { name: "Social Accounts", path: "#", action: () => handleAction("Social Accounts"), iconColor: "text-blue-500", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
      ]
    },
    {
      title: "Automation",
      items: []
    }
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-5 px-3.5 select-none">
      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="flex items-center justify-between mb-2 px-3">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400/90 dark:text-slate-500">
                {sec.title}
              </h2>
              {sec.title === "Automation" && (
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </div>
            <ul className="space-y-1">
              {sec.items.map((item) => {
                const isActive = pathname === item.path;
                
                const linkContent = (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-amber-500" : `${item.iconColor} group-hover:scale-110 transition-transform`}>
                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </span>
                      <span className={isActive ? "text-amber-500 font-extrabold" : "text-gray-600 dark:text-gray-300 group-hover:text-slate-800 dark:group-hover:text-white"}>
                        {item.name}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-rose-500 px-1 py-0.5 text-[8px] font-black uppercase tracking-wide text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </>
                );

                return (
                  <li key={item.name}>
                    {item.action ? (
                      <button
                        onClick={item.action}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-gray-500 hover:bg-gray-100 hover:text-slate-800 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-white cursor-pointer group"
                      >
                        {linkContent}
                      </button>
                    ) : (
                      <Link
                        href={item.path}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer group ${
                          isActive
                            ? "bg-amber-500/10 text-amber-500 font-extrabold"
                            : "text-gray-500 hover:bg-gray-100 hover:text-slate-800 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-white"
                        }`}
                      >
                        {linkContent}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0f1016]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[99999] flex md:hidden">
          <div onClick={toggleMobileSidebar} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
          <div className="relative flex w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0f1016] animate-slide-right h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
