"use client";

import React, { useState } from "react";
import { Search, Plus, FolderOpen, MoreVertical, Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  courseCount: number;
  status: "Hiển thị" | "Ẩn";
  createdDate: string;
}

const initialCategories: Category[] = [
  { id: "DM001", name: "Lập trình Frontend", courseCount: 12, status: "Hiển thị", createdDate: "10/05/2026" },
  { id: "DM002", name: "Lập trình Backend", courseCount: 8, status: "Hiển thị", createdDate: "12/05/2026" },
  { id: "DM003", name: "Thiết kế UI/UX", courseCount: 5, status: "Hiển thị", createdDate: "14/05/2026" },
  { id: "DM004", name: "Marketing Online", courseCount: 4, status: "Ẩn", createdDate: "16/05/2026" },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `DM00${categories.length + 1}`,
      name: newCatName,
      courseCount: 0,
      status: "Hiển thị",
      createdDate: new Date().toLocaleDateString("vi-VN"),
    };
    setCategories([...categories, newCat]);
    setNewCatName("");
    setShowAddForm(false);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh mục khóa học</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý các nhóm khóa học và phân loại của bạn.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Thêm danh mục</h3>
            <input
              type="text"
              placeholder="Tên danh mục"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2.5 text-sm">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCatName("");
                }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-theme-xxs"
        />
      </div>

      {/* Grid Table */}
      <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xxs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left bg-gray-50/50 dark:bg-gray-900/40">
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-gray-400">Tên danh mục</th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-gray-400">Số khóa học</th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-gray-400">Trạng thái</th>
                <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-gray-400">Ngày tạo</th>
                <th className="px-6 py-3.5 text-right font-bold text-gray-500 dark:text-gray-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                      <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{cat.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                    {cat.courseCount} khóa học
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cat.status === "Hiển thị"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cat.createdDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
