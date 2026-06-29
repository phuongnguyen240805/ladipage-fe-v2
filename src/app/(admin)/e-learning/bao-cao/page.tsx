'use client';

import React from 'react';
import { BarChart2, Users, BookOpen, TrendingUp, FileText, Download, ChevronRight } from 'lucide-react';

const summaryCards = [
  { label: 'Tổng sinh viên', value: '1,248', change: '+5.2%', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', changeColor: 'text-green-600 dark:text-green-400' },
  { label: 'Tổng giảng viên', value: '86', change: '+2.4%', icon: BookOpen, color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', changeColor: 'text-green-600 dark:text-green-400' },
  { label: 'Môn học đang dạy', value: '142', change: '+8.1%', icon: BarChart2, color: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400', changeColor: 'text-green-600 dark:text-green-400' },
  { label: 'Tỷ lệ hoàn thành', value: '87.3%', change: '+1.5%', icon: TrendingUp, color: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400', changeColor: 'text-green-600 dark:text-green-400' },
];

const reports = [
  { title: 'Báo cáo kết quả học tập HK1 2025–2026', type: 'PDF', date: '10/06/2026', size: '2.4 MB', color: 'text-red-500' },
  { title: 'Thống kê điểm danh tháng 5/2026', type: 'Excel', date: '01/06/2026', size: '1.1 MB', color: 'text-green-500' },
  { title: 'Danh sách sinh viên tốt nghiệp 2026', type: 'PDF', date: '25/05/2026', size: '3.8 MB', color: 'text-red-500' },
  { title: 'Báo cáo tuyển sinh năm học 2025–2026', type: 'PDF', date: '15/05/2026', size: '1.7 MB', color: 'text-red-500' },
  { title: 'Thống kê học phí học kỳ 1', type: 'Excel', date: '10/05/2026', size: '0.8 MB', color: 'text-green-500' },
  { title: 'Tổng hợp nghiên cứu khoa học sinh viên', type: 'Word', date: '05/05/2026', size: '2.2 MB', color: 'text-blue-500' },
];

export default function BaoCaoPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
          <BarChart2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Báo cáo &amp; Thống kê</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tổng quan và các báo cáo hệ thống</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{card.value}</p>
                <p className={`text-xs font-medium mt-1 ${card.changeColor}`}>{card.change} so với kỳ trước</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Danh sách báo cáo
          </h2>
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Xem tất cả</button>
        </div>
        <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {reports.map((r) => (
            <li key={r.title} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${r.color} border-current opacity-70`}>{r.type}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{r.date} · {r.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                  <Download className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
