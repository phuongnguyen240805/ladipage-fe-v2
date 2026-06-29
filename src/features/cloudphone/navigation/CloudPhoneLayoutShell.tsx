"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  name: string;
  path: string;
  action?: () => void;
  icon: string;
  iconColor: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function CloudPhoneLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleAction = (name: string) => {
    alert(`Tính năng "${name}" đang được cập nhật!`);
  };

  const sections: MenuSection[] = [
    {
      title: "Dashboard",
      items: [
        { name: "Cửa hàng cho thuê", path: "/cloudphone/cua-hang-cho-thue", iconColor: "text-amber-500", icon: "M3.75 6.75h16.5M5.25 6.75l1.2 12h11.1l1.2-12M9 10.5h6m-5.25 3h4.5" },
        { name: "Quản lý thiết bị", path: "/cloudphone/quan-ly-thiet-bi", iconColor: "text-indigo-500", icon: "M10.5 1.5h3M8.25 3h7.5A2.25 2.25 0 0118 5.25v13.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 18.75V5.25A2.25 2.25 0 018.25 3zm2.25 15h3" },
        { name: "Vòng quay may mắn", path: "#", action: () => handleAction("Vòng quay may mắn"), iconColor: "text-amber-500", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", badge: "HOT" },
      ]
    },
    {
      title: "Social Automation",
      items: [
        { name: "Quản lý dịch vụ", path: "#", action: () => handleAction("Quản lý dịch vụ"), iconColor: "text-slate-500", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" },
        { name: "Social Accounts", path: "/cloudphone/social-accounts", iconColor: "text-blue-500", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
      ]
    },
    {
      title: "Automation",
      items: [
        { name: "Workflow Store", path: "/cloudphone/workflow-store", iconColor: "text-blue-500", icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.838A3 3 0 0015 6h-6A3 3 0 006.144 8.662L4.5 18a3 3 0 003 3h9a3 3 0 003-3l-1.656-9.338z" },
        { name: "Điều khiển đồng bộ", path: "/cloudphone/dieu-khien-dong-bo", iconColor: "text-emerald-500", icon: "M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-7.5A2.25 2.25 0 006.75 10.5V18" },
        { name: "Workflow Manager", path: "/cloudphone/workflow-manager", iconColor: "text-purple-500", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07" },
        { name: "File Manager", path: "/cloudphone/file-manager", iconColor: "text-amber-500", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
        { name: "Account Manager", path: "/cloudphone/account-manager", iconColor: "text-sky-500", icon: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" },
      ]
    }
  ];

  return (
    <div className="flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#0c0d14] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden shadow-theme-xs min-h-[calc(100vh-46px)]">
      {/* CloudPhone Sub-sidebar */}
      <div className={`shrink-0 bg-slate-50 dark:bg-[#090a0f] flex flex-col select-none border-r border-gray-200/50 dark:border-gray-800/40 transition-all duration-300 ${
        isCollapsed
          ? "w-0 overflow-hidden !py-0 !px-0 !border-r-0"
          : "w-full md:w-60 py-5 px-3.5"
      }`}>
        <div className="flex items-center gap-2 px-2 pb-3.5 border-b border-gray-200/40 dark:border-gray-800/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75h.008v.008H12v-.008zm-3.75-15h7.5A2.25 2.25 0 0118 6v12A2.25 2.25 0 0115.75 20.25h-7.5A2.25 2.25 0 016 18V6A2.25 2.25 0 018.25 3.75z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold text-slate-800 dark:text-white">CloudPhone</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-amber-500">App</div>
          </div>
        </div>

        <div className="mt-4 space-y-5">
          {sections.map((sec) => (
            <div key={sec.title}>
              <div className="flex items-center justify-between mb-2 px-2">
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
                        <span className={isActive ? "text-amber-500" : `${item.iconColor} group-hover:scale-105 transition-transform`}>
                          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                        </span>
                        <span className={isActive ? "text-amber-500 font-extrabold" : "text-gray-600 dark:text-gray-300 group-hover:text-slate-800 dark:group-hover:text-white"}>
                          {item.name}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white leading-none">
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

      {/* Content pane */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-100/40 dark:bg-[#0d0e15] relative">
        {/* Sub-sidebar Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-[260px] z-40 hidden md:flex items-center justify-center w-6 h-6 bg-lime-500 hover:bg-lime-600 text-white rounded-full shadow-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 border border-lime-400"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          )}
        </button>

        {children}
      </div>
    </div>
  );
}
