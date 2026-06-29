import React, { useState, useEffect } from "react";
import { TagItem } from "../dung-chung/types";
import { IconSearch } from "../dung-chung/icons";
import { CreateTagModal } from "./CreateTagModal";

interface TagManagementProps {
  tags: TagItem[];
  onAddTag: (name: string) => void;
}

export const TagManagement: React.FC<TagManagementProps> = ({
  tags,
  onAddTag,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; tagName: string }>({
    visible: false,
    tagName: "",
  });

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTags.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleCreateTag = (name: string) => {
    onAddTag(name);
    // Show toast
    setToast({ visible: true, tagName: name });
  };

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Quản lý Tag
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Gắn thẻ cho Landing Page để phân loại dễ dàng hơn.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
        >
          <span>+ Tạo Tag mới</span>
        </button>
      </div>

      {/* Filter search bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 my-4">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-hidden focus:border-lime-400"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden flex flex-col justify-between min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 select-none">
                <th className="py-3 px-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredTags.length > 0 && selectedIds.length === filteredTags.length}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer" 
                  />
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Tên Tag</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Số lượng</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Ngày tạo</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
                    <span>Ngày cập nhật</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                </th>
                <th className="py-3 px-4 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTags.length > 0 ? (
                filteredTags.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id}
                      className={`transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10 ${
                        isSelected ? "bg-[#f4f7ff] dark:bg-lime-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-gray-300 text-lime-500 focus:ring-lime-400 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-3.5 py-1 text-xs font-bold text-slate-750 bg-gray-100 dark:bg-gray-800 dark:text-slate-200 rounded-lg select-none">
                          {item.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-slate-800 dark:text-gray-200">
                        {item.count}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-400">
                        {/* Lock Outline Icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.updatedAt}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 p-1 cursor-pointer">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                    Chưa có Tag nào khớp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 pr-8 text-[13px] font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer">
                <option>20</option>
              </select>
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>
            <span className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
              Hiển thị 1-{filteredTags.length} trên {filteredTags.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-300 dark:text-slate-600 transition cursor-not-allowed" disabled>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-md bg-lime-500 text-white font-semibold text-xs shadow-xs cursor-pointer">
              1
            </button>
            <button className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-gray-800 text-slate-300 dark:text-slate-600 transition cursor-not-allowed" disabled>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateTagModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTag={(name) => handleCreateTag(name)}
      />

      {/* Success Toast Notification at Bottom Right */}
      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3.5 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-theme-lg px-5 py-4 min-w-[280px] animate-slide-in-right">
          {/* Green check icon */}
          <span className="w-7 h-7 rounded-full bg-success-50 dark:bg-success-950/30 text-success-550 dark:text-success-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 dark:text-white block">
              Đã tạo tag
            </span>
            <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-500 block">
              {toast.tagName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
