"use client";

import React, { useState } from "react";
import { Search, Plus, GraduationCap } from "lucide-react";

const mockLecturers = [
  { id: "GV001", name: "TS. Nguyễn Văn An", department: "Khoa CNTT", title: "Tiến sĩ", classes: 4 },
  { id: "GV002", name: "PGS. Trần Thị Bích", department: "Khoa Kinh tế", title: "Phó Giáo sư", classes: 3 },
  { id: "GV003", name: "ThS. Lê Minh Cường", department: "Khoa Ngoại ngữ", title: "Thạc sĩ", classes: 5 },
  { id: "GV004", name: "GS. Phạm Quốc Dũng", department: "Khoa Cơ bản", title: "Giáo sư", classes: 2 },
  { id: "GV005", name: "TS. Hoàng Thị Em", department: "Khoa CNTT", title: "Tiến sĩ", classes: 4 },
  { id: "GV006", name: "ThS. Vũ Đình Phúc", department: "Khoa Điện tử", title: "Thạc sĩ", classes: 6 },
];

const titleColors: Record<string, string> = {
  "Giáo sư": "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "Phó Giáo sư": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "Tiến sĩ": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Thạc sĩ": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

export default function GiangVienPage() {
  const [search, setSearch] = useState("");
  const filtered = mockLecturers.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Giảng viên</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{mockLecturers.length} giảng viên trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-600">
          <Plus className="h-4 w-4" /> Thêm giảng viên
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm giảng viên, bộ môn..."
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-lime-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Mã GV", "Họ tên", "Bộ môn", "Học hàm/Học vị", "Số lớp dạy"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">{l.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                        <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{l.department}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${titleColors[l.title] ?? "bg-gray-100 text-gray-600"}`}>
                      {l.title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-900 dark:text-white">{l.classes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
