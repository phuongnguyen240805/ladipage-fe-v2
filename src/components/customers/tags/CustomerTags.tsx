import React, { useState } from "react";
import { TagItem } from "../dung-chung/types";
import { IconSearch, IconX, IconTag } from "../dung-chung/icons";

export const CustomerTags: React.FC = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const now = new Date();
    const timeStr =
      now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      now.toLocaleDateString("vi-VN");

    const newTag: TagItem = {
      id: "TG" + (100 + tags.length + 1),
      name: newTagName.trim(),
      count: 0,
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    setTags((prev) => [newTag, ...prev]);
    triggerToast("Tạo Tag mới thành công!");
    setIsModalOpen(false);
    setNewTagName("");
  };

  const handleDeleteTag = (id: string, name: string) => {
    setTags((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Đã xóa tag ${name} thành công!`);
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-150 dark:border-gray-850 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-inter">
            Quản lý Tag
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed font-inter">
            Sử dụng tag để phân loại và lọc khách hàng nhanh chóng.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer font-inter"
          >
            <span>Tạo Tag mới</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên Tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400 font-medium"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Tổng số: {tags.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-855 bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3.5 px-6 text-xs font-bold text-slate-850 dark:text-slate-200 tracking-wider">
                  Tên Tag
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Số lượng khách hàng
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày tạo
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày cập nhật
                </th>
                <th className="py-3.5 px-6 w-20 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTags.length > 0 ? (
                filteredTags.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-gray-800/10"
                  >
                    <td className="py-4 px-6 text-xs font-semibold text-slate-800 dark:text-white">
                      <span className="px-2 py-0.5 text-[11px] font-bold text-lime-600 bg-lime-50 dark:text-lime-200 dark:bg-lime-950/30 rounded-full">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-800 dark:text-white">
                      {item.count}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.createdAt}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.updatedAt}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteTag(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded transition cursor-pointer"
                        title="Xóa Tag"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty state */
                <tr>
                  <td colSpan={5} className="py-20 text-center select-none">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-gray-800">
                        <IconTag size={26} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-inter">
                        Chưa có tag nào.
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs font-medium font-inter">
                        Tag giúp bạn đánh dấu và phân nhóm khách hàng thủ công nhanh chóng. Hãy tạo tag đầu tiên của bạn.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4.5 py-1.5 border border-lime-500 bg-lime-500 text-xs font-bold text-white hover:bg-lime-600 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        + Tạo Tag mới
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-855 p-4 bg-gray-50/20 dark:bg-gray-900/10">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-455 dark:text-slate-500 font-medium font-inter">
              Đang hiển thị 1-{filteredTags.length} đến {filteredTags.length} của {tags.length} bản ghi
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-zoom-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-150 dark:border-gray-855">
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-inter">
                Tạo Tag mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTag} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 font-inter">
                  Tên Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: VIP, Mua lại nhiều lần..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-800 rounded-lg px-3.5 py-2 text-xs bg-white dark:bg-gray-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-lime-400 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-slate-55 dark:hover:bg-gray-800 text-xs font-bold text-slate-700 dark:text-slate-350 rounded-lg transition cursor-pointer font-inter"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-xs font-bold text-white rounded-lg shadow-sm transition duration-150 cursor-pointer font-inter"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3 bg-slate-900 text-white dark:bg-gray-850 border border-slate-800 dark:border-gray-800 rounded-xl shadow-xl px-4 py-3 min-w-[200px] animate-slide-in-right text-xs font-bold">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
