import React from "react";
import { IconPlus } from "../dung-chung/icons";

interface ReportsSidebarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

const defaultReports = [
  {
    id: "sales",
    label: "Bán hàng",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.38-.178m3.38.178l-.855 3.386" />
      </svg>
    ),
  },
  {
    id: "business",
    label: "Kinh doanh",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12m0 0l-3-3m3 3l3-3M3 12h18M5 12V6a2 2 0 012-2h10a2 2 0 012 2v6" />
      </svg>
    ),
  },
  {
    id: "customers",
    label: "Khách hàng",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    id: "jobs",
    label: "Công việc",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m-6.375-6h.008v.008H6V12zm0 3h.008v.008H6V15zm0 3h.008v.008H6V18m6-9h.008v.008H12V9zm0-3h.008v.008H12V6zm0 15h.008v.008H12v-.008zm4-3a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0-3a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0-3a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    id: "automation",
    label: "Tự động hóa",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

export const ReportsSidebar: React.FC<ReportsSidebarProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  return (
    <div className="w-full lg:w-60 bg-[#f4f4fa] dark:bg-[#13141f] border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 h-full p-4 overflow-y-auto">
      {/* Title */}
      <h2 className="text-[17px] font-bold text-slate-800 dark:text-white px-2 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-lime-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <span>Analytics</span>
      </h2>

      {/* Default Reports */}
      <div className="space-y-1.5 mb-6">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-3 select-none">
          Báo cáo mặc định
        </span>
        <nav className="space-y-1">
          {defaultReports.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative group ${
                  isActive
                    ? "bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300 font-semibold"
                    : "text-slate-650 hover:bg-gray-200/50 dark:text-slate-400 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`${
                      isActive
                        ? "text-[#65a30d] dark:text-lime-300"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-350"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-lime-500 dark:bg-lime-400 rounded-r-md" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Custom Reports */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-3 mb-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase select-none">
            Báo cáo tùy chỉnh
          </span>
          <button className="text-slate-400 hover:text-lime-500 dark:hover:text-lime-300 transition cursor-pointer p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-white/5">
            <IconPlus size={12} />
          </button>
        </div>
        <div className="px-3 py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-normal">
            Chưa có thư mục báo cáo nào.
          </p>
        </div>
      </div>
    </div>
  );
};
