'use client';

import React, { useState } from 'react';
import { Search, Plus, GraduationCap, ChevronDown } from 'lucide-react';

const students = [
  { id: 'SV001', name: 'Nguyễn Văn An', class: 'CNTT01', major: 'Công nghệ thông tin', status: 'Đang học' },
  { id: 'SV002', name: 'Trần Thị Bình', class: 'CNTT01', major: 'Công nghệ thông tin', status: 'Đang học' },
  { id: 'SV003', name: 'Lê Minh Châu', class: 'KT02', major: 'Kế toán', status: 'Đang học' },
  { id: 'SV004', name: 'Phạm Hồng Dương', class: 'QTKD01', major: 'Quản trị kinh doanh', status: 'Bảo lưu' },
  { id: 'SV005', name: 'Hoàng Thị Lan', class: 'KT02', major: 'Kế toán', status: 'Đang học' },
  { id: 'SV006', name: 'Vũ Đức Mạnh', class: 'CNTT02', major: 'Công nghệ thông tin', status: 'Đang học' },
  { id: 'SV007', name: 'Đặng Thị Ngọc', class: 'QTKD01', major: 'Quản trị kinh doanh', status: 'Thôi học' },
  { id: 'SV008', name: 'Bùi Văn Phú', class: 'CNTT02', major: 'Công nghệ thông tin', status: 'Đang học' },
];

const statusColor: Record<string, string> = {
  'Đang học': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Bảo lưu': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Thôi học': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function SinhVienPage() {
  const [search, setSearch] = useState('');
  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Sinh viên</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách và thông tin sinh viên</p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Thêm sinh viên
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Mã SV', 'Họ tên', 'Lớp', 'Ngành', 'Trạng thái'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <span className="flex items-center gap-1">{h} <ChevronDown className="w-3 h-3" /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/20'}`}>
                  <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">{s.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.class}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{s.major}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[s.status]}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
          Hiển thị {filtered.length} / {students.length} sinh viên
        </div>
      </div>
    </div>
  );
}
