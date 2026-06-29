"use client";

import React, { useState } from "react";
import { Search, Plus, SlidersHorizontal, BookOpen, User, CheckCircle, Clock } from "lucide-react";

interface Course {
  id: string;
  name: string;
  status: "Đang hoạt động" | "Bản nháp" | "Tạm ngưng";
  creator: string;
  createdDate: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [showDemoCreator, setShowDemoCreator] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  const handleAddCourse = (name: string) => {
    if (!name.trim()) return;
    const newCourse: Course = {
      id: `KH${Math.floor(100 + Math.random() * 900)}`,
      name,
      status: "Đang hoạt động",
      creator: "cong",
      createdDate: new Date().toLocaleDateString("vi-VN"),
    };
    setCourses([...courses, newCourse]);
    setNewCourseName("");
    setShowDemoCreator(false);
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trang khóa học</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý các khóa học của bạn một cách dễ dàng.
          </p>
        </div>
        <button 
          onClick={() => setShowDemoCreator(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo khóa học mới
        </button>
      </div>

      {/* Demo Course Creator Modal */}
      {showDemoCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Tạo khóa học mới</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nhập tên khóa học bạn muốn tạo.</p>
            <input
              type="text"
              placeholder="Ví dụ: Khóa học lập trình Next.js nâng cao"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCourse(newCourseName);
              }}
            />
            <div className="flex justify-end gap-2.5 text-sm">
              <button
                onClick={() => {
                  setShowDemoCreator(false);
                  setNewCourseName("");
                }}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleAddCourse(newCourseName)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Tạo ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-theme-xxs"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-theme-xxs">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          Lọc nâng cao
        </button>
      </div>

      {/* Main Table / Container */}
      <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xxs overflow-hidden">
        {filteredCourses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="p-4 rounded-full bg-slate-50 dark:bg-gray-800/50 mb-4">
              <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-400 dark:text-gray-500">Chưa có khoá học nào</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
              Hãy nhấn nút "Tạo khóa học mới" để thêm khóa học đầu tiên của bạn vào hệ thống.
            </p>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left bg-gray-50/50 dark:bg-gray-900/40">
                  <th className="w-12 px-6 py-3.5">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-gray-500 dark:text-gray-400">Tên khóa học</th>
                  <th className="px-4 py-3.5 font-bold text-gray-500 dark:text-gray-400">Trạng thái</th>
                  <th className="px-4 py-3.5 font-bold text-gray-500 dark:text-gray-400">Người tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <span className="block font-semibold">{course.name}</span>
                          <span className="block text-xxs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                            {course.id} • Cập nhật: {course.createdDate}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black uppercase">
                          {course.creator[0]}
                        </div>
                        <span>{course.creator}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
