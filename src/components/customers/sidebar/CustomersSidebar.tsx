import React from "react";
import {
  IconUser,
  IconBuilding,
  IconSegment,
  IconTag,
  IconCustomField,
  IconErrorLog,
} from "../dung-chung/icons";

interface CustomersSidebarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

const customerNav = [
  {
    id: "customers",
    label: "Danh sách",
    icon: <IconUser size={16} />,
  },
  {
    id: "companies",
    label: "Danh sách công ty",
    icon: <IconBuilding size={16} />,
  },
  {
    id: "segments",
    label: "Quản lý Segment",
    icon: <IconSegment size={16} />,
  },
  {
    id: "tags",
    label: "Quản lý Tag",
    icon: <IconTag size={16} />,
  },
  {
    id: "custom-fields",
    label: "Trường tuỳ chỉnh",
    icon: <IconCustomField size={16} />,
  },
  {
    id: "error-logs",
    label: "Lịch sử lỗi",
    icon: <IconErrorLog size={16} />,
  },
];

export const CustomersSidebar: React.FC<CustomersSidebarProps> = ({
  activeSubTab,
  setActiveSubTab,
}) => {
  return (
    <div className="w-full lg:w-60 bg-[#f4f4fa] dark:bg-[#13141f] border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 h-full p-4 overflow-y-auto">
      {/* Title */}
      <h2 className="text-[17px] font-bold text-slate-800 dark:text-white px-2 mb-1">
        Khách hàng
      </h2>

      {/* Customer Group */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-3 select-none">
          Quản lý khách hàng
        </span>
        <nav className="space-y-1">
          {customerNav.map((item) => {
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
    </div>
  );
};
