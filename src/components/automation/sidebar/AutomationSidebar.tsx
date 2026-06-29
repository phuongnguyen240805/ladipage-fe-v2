import React, { useState } from "react";

interface AutomationSidebarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export const AutomationSidebar: React.FC<AutomationSidebarProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  const [isSetupOpen, setIsSetupOpen] = useState(true);

  const mainMenu = [
    {
      id: "flows",
      label: "Flows",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="19" r="2.5" />
          <circle cx="6" cy="5" r="2.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5v9m0-9a4 4 0 0 1 4 4h4.5a3.5 3.5 0 0 0 3.5-3.5" />
        </svg>
      ),
    },
    {
      id: "campaigns",
      label: "Campaigns",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
    },
    {
      id: "sequences",
      label: "Sequences",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-3.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: "templates",
      label: "Thư viện mẫu",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
  ];

  const setupMenu = [
    { id: "settings", label: "Cài đặt chung" },
    { id: "integrations", label: "Tích hợp" },
    { id: "tags", label: "Quản lý Tag" },
    { id: "promotions", label: "Chương trình khuyế..." },
    { id: "activities", label: "Hoạt động" },
    { id: "account_status", label: "Tình trạng tài khoản" },
  ];

  return (
    <div className="w-full lg:w-60 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 h-full py-4 px-2 overflow-y-auto">
      {/* Title */}
      <h2 className="text-sm font-bold text-slate-800 dark:text-white px-4 py-2 select-none">
        Automation
      </h2>

      {/* Main Menu Items */}
      <nav className="space-y-0.5 mt-2">
        {mainMenu.map((item) => {
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer relative group ${
                isActive
                  ? "bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300"
                  : "text-slate-650 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/5"
              }`}
            >
              <span className={`${isActive ? "text-[#65a30d] dark:text-lime-300" : "text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-350"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Thiết lập parent node */}
        <div>
          <button
            onClick={() => setIsSetupOpen(!isSetupOpen)}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-semibold text-slate-650 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/5 transition cursor-pointer group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-350">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span>Thiết lập</span>
            </div>
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform ${isSetupOpen ? "rotate-0" : "-rotate-90"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Sub-menu items indented */}
          {isSetupOpen && (
            <div className="pl-6 space-y-0.5 mt-0.5">
              {setupMenu.map((subItem) => {
                const isActive = activeSubTab === subItem.id;
                return (
                  <button
                    key={subItem.id}
                    onClick={() => setActiveSubTab(subItem.id)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300"
                        : "text-slate-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/5"
                    }`}
                  >
                    {subItem.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
