import React, { useState, useEffect } from "react";
import { TagItem } from "../dung-chung/types";
import { IconLockClosed, IconLockOpen, IconSearch } from "../dung-chung/icons";
import { CreateTagModal } from "./CreateTagModal";

interface TagManagementProps {
  tags: TagItem[];
  onAddTag: (name: string) => Promise<void>;
  onUpdateTag: (id: string, name: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onDeleteTags: (ids: string[]) => Promise<void>;
  onToggleTagStatus: (id: string, status: TagItem["status"]) => Promise<void>;
}

export const TagManagement: React.FC<TagManagementProps> = ({
  tags,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onDeleteTags,
  onToggleTagStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  useEffect(() => {
    if (!openMenuId) return;
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [openMenuId]);

  const showToast = (message: string) => setToast({ visible: true, message });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTags.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleCreateTag = async (name: string) => {
    setIsSubmitting(true);
    try {
      await onAddTag(name);
      showToast(`Đã tạo tag "${name}"`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể tạo tag.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTag = async (name: string) => {
    if (!editingTag) return;
    setIsSubmitting(true);
    try {
      await onUpdateTag(editingTag.id, name);
      showToast(`Đã cập nhật tag "${name}"`);
      setEditingTag(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật tag.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOne = async (tag: TagItem) => {
    if (!window.confirm(`Xóa tag "${tag.name}"?`)) return;
    try {
      await onDeleteTag(tag.id);
      setSelectedIds((prev) => prev.filter((id) => id !== tag.id));
      showToast(`Đã xóa tag "${tag.name}"`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa tag.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`Xóa ${count} tag đã chọn?`)) return;
    try {
      await onDeleteTags(selectedIds);
      setSelectedIds([]);
      showToast(`Đã xóa ${count} tag`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa tag.");
    }
  };

  const handleToggleStatus = async (tag: TagItem) => {
    const nextStatus = tag.status === "LOCKED" ? "UNLOCKED" : "LOCKED";
    try {
      await onToggleTagStatus(tag.id, nextStatus);
      showToast(
        nextStatus === "LOCKED" ? `Đã khóa tag "${tag.name}"` : `Đã mở khóa tag "${tag.name}"`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể đổi trạng thái tag.");
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5 mb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Quản lý Tag
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Gắn thẻ cho Landing Page để phân loại dễ dàng hơn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
            >
              Xóa ({selectedIds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm transition duration-150 cursor-pointer"
          >
            <span>+ Tạo Tag mới</span>
          </button>
        </div>
      </div>

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
                  Tên Tag
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Số lượng
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày tạo
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-855 dark:text-slate-200 tracking-wider">
                  Ngày cập nhật
                </th>
                <th className="py-3 px-4 w-16 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTags.length > 0 ? (
                filteredTags.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isLocked = item.status === "LOCKED";
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
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold text-lime-500 bg-lime-50 border border-lime-100/40 dark:text-lime-300 dark:bg-lime-950/40 rounded-full">
                          {item.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-slate-800 dark:text-gray-200">
                        {item.count}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.createdAt}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          title={isLocked ? "Mở khóa tag" : "Khóa tag"}
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition cursor-pointer ${
                            isLocked
                              ? "bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-950/25 dark:text-amber-400 dark:hover:bg-amber-950/40"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-gray-800 dark:text-slate-500 dark:hover:bg-gray-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {isLocked ? (
                            <IconLockClosed size={15} />
                          ) : (
                            <IconLockOpen size={15} />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.updatedAt}
                      </td>
                      <td className="py-3.5 px-4 text-center relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId((prev) => (prev === item.id ? null : item.id));
                          }}
                          className="text-slate-400 hover:text-slate-650 dark:hover:text-gray-300 p-1 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>
                        {openMenuId === item.id && (
                          <div
                            className="absolute right-4 top-10 z-20 min-w-[140px] rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-md py-1 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTag(item);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-left"
                            >
                              Sửa tên
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                void handleDeleteOne(item);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer text-left"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                    {tags.length === 0 ? "Chưa có tag nào" : "Chưa có Tag nào khớp với bộ lọc"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/20 dark:bg-gray-900/10">
          <span className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
            Hiển thị {filteredTags.length > 0 ? `1-${filteredTags.length}` : "0"} trên {tags.length}
          </span>
        </div>
      </div>

      <CreateTagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTag}
        isSubmitting={isSubmitting}
      />

      <CreateTagModal
        isOpen={Boolean(editingTag)}
        onClose={() => setEditingTag(null)}
        onSubmit={handleEditTag}
        mode="edit"
        initialName={editingTag?.name ?? ""}
        isSubmitting={isSubmitting}
      />

      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-999999 flex items-center gap-3.5 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-theme-lg px-5 py-4 min-w-[280px] animate-slide-in-right">
          <span className="w-7 h-7 rounded-full bg-success-50 dark:bg-success-950/30 text-success-550 dark:text-success-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-white block">{toast.message}</span>
        </div>
      )}
    </div>
  );
};