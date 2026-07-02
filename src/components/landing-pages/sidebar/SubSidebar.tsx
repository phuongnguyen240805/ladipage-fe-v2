import React from "react";
import { IconSearch } from "../dung-chung/icons";
import type { TagItem } from "../dung-chung/types";

interface SubSidebarProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  tagSearchQuery: string;
  setTagSearchQuery: (query: string) => void;
  tags: TagItem[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

const subSidebarNav = [
  { id: "pages", label: "Trang", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )},
  { id: "templates", label: "Thư viện mẫu", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.25a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 20v-4.25a2.25 2.25 0 012.25-2.25zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
    </svg>
  )},
  { id: "forms", label: "Cấu hình Form", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { id: "tags", label: "Quản lý Tags", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.592 0l4.318-4.318a1.125 1.125 0 000-1.591l-9.581-9.581A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )},
  { id: "domains", label: "Tên miền", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  )},
  { id: "leads", label: "Data Leads", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )},
];

export const SubSidebar: React.FC<SubSidebarProps> = ({
  activeSubTab,
  setActiveSubTab,
  tagSearchQuery,
  setTagSearchQuery,
  tags,
  selectedTagId,
  onSelectTag,
}) => {
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()),
  );

  return (
    <div className="w-full lg:w-60 bg-[#f4f4fa] dark:bg-[#13141f] border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 h-full p-4">
      {/* Title */}
      <h2 className="text-[17px] font-bold text-slate-800 dark:text-white px-2 mb-4">
        Landing Pages
      </h2>

      {/* Sub-tabs List */}
      <nav className="space-y-1 mb-6">
        {subSidebarNav.map((item) => {
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
                <span className={`${isActive ? "text-[#65a30d] dark:text-lime-300" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-350"}`}>
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

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-800 my-2" />

      {/* Tags filter section */}
      <div className="flex-1 flex flex-col pt-4 min-h-0">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            Lọc theo tags
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Tạo tag mới"
              onClick={() => setActiveSubTab("tags")}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            {selectedTagId && (
              <button
                type="button"
                title="Bỏ lọc tag"
                onClick={() => onSelectTag(null)}
                className="text-[10px] font-semibold text-slate-400 hover:text-lime-500 dark:hover:text-lime-300 cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Search box for Tag */}
        <div className="relative mb-3 px-1">
          <span className="absolute inset-y-0 left-3 flex items-center pl-1.5 text-slate-400">
            <IconSearch size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={tagSearchQuery}
            onChange={(e) => setTagSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
          />
        </div>

        {/* Tag filter list */}
        <div className="pt-0.5 px-1.5 flex flex-wrap gap-1.5 content-start min-h-0 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`inline-flex w-fit items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border transition cursor-pointer text-lime-500 bg-lime-50 border-lime-100/40 dark:text-lime-300 dark:bg-lime-950/40 ${
              selectedTagId === null ? "ring-1 ring-lime-400/60" : "opacity-80 hover:opacity-100"
            }`}
          >
            Tất cả
          </button>

          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => {
              const isActive = selectedTagId === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onSelectTag(tag.id)}
                  className={`inline-flex w-fit items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border transition cursor-pointer text-lime-500 bg-lime-50 border-lime-100/40 dark:text-lime-300 dark:bg-lime-950/40 ${
                    isActive ? "ring-1 ring-lime-400/60" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="truncate max-w-[120px]">{tag.name}</span>
                  {tag.count > 0 && (
                    <span className="text-[10px] font-bold opacity-70">{tag.count}</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="w-full flex items-center justify-center text-[12px] text-slate-400 italic mt-4 select-none text-center px-2">
              {tags.length === 0 ? "Chưa có tag" : "Không tìm thấy tag"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
