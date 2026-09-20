import React from "react";
import { useResizableSidebar } from "@/hooks/useResizableSidebar";
import { ResizeHandle } from "@/components/common/ResizeHandle";
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
  const { width, isDragging, handleMouseDown, resetWidth } = useResizableSidebar({
    defaultWidth: 200,
    minWidth: 180,
    maxWidth: 460,
  });

  return (
    <div
      style={{ "--sub-sidebar-width": `${width}px` } as React.CSSProperties}
      className="ladi-sub-sidebar border-r border-kedi-navy/10 bg-white dark:border-white/10 dark:bg-kedi-navy"
    >
      <ResizeHandle
        onMouseDown={handleMouseDown}
        onDoubleClick={resetWidth}
        isDragging={isDragging}
      />
      <div className="ladi-sub-sidebar-body p-3">
      {/* Title */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-2 mb-1">
        Khách hàng
      </h2>

      {/* Customer Group */}
      <div>
        <span className="text-ui-micro font-semibold text-slate-400 dark:text-slate-500 tracking-[0.08em] uppercase px-3 select-none">
          Quản lý khách hàng
        </span>
        <nav className="space-y-1">
          {customerNav.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`menu-item group ${
                  isActive ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className={isActive ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                  {item.icon}
                </span>
                <span className="menu-item-text">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      </div>
    </div>
  );
};
