"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FacebookAdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Tài khoản QC",
      path: "/facebook-ads/tai-khoan-qc",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.34-1.16-1.04-1.16-1.84V9.58c0-.8.48-1.5 1.16-1.84L15.34 5.9c1.03-.52 2.16.24 2.16 1.4v13.4c0 1.16-1.13 1.92-2.16 1.4l-5-2.66zM7.5 9.5h-1a2.5 2.5 0 00-2.5 2.5v1a2.5 2.5 0 002.5 2.5h1" />
        </svg>
      ),
    },
    {
      name: "Tài khoản BM",
      path: "/facebook-ads/tai-khoan-bm",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76zM16.5 10.5h-3v3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
        </svg>
      ),
    },
    {
      name: "Fanpage",
      path: "/facebook-ads/fanpage",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 8h6M9 12h6M9 16h6" />
        </svg>
      ),
    },
    {
      name: "Email tạm thời",
      path: "/facebook-ads/email-tam-thoi",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Cài đặt",
      path: "/facebook-ads/cai-dat",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#0c0d14] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden shadow-theme-xs min-h-[calc(100vh-46px)]">
      {/* Sub Sidebar */}
      <div className="w-full md:w-56 shrink-0 bg-slate-50 dark:bg-[#090a0f] py-5 px-3.5 flex flex-col select-none">
        {/* Sub Sidebar Header */}
        <div className="flex items-center gap-2 px-2 pb-3.5 border-b border-gray-200/40 dark:border-gray-800/30">
          <span className="font-extrabold text-sm text-slate-800 dark:text-white truncate">Ads Manager</span>
          <span className="bg-lime-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none">App</span>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-lime-500/10 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-100/40 dark:bg-[#0d0e15]">
        {children}
      </div>
    </div>
  );
}
