"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const periods = ["Tiết 1-2\n07:00–08:30", "Tiết 3-4\n08:45–10:15", "Tiết 5-6\n10:30–12:00", "Tiết 7-8\n13:00–14:30", "Tiết 9-10\n14:45–16:15"];

const schedule: Record<string, { subject: string; room: string; lecturer: string; color: string }> = {
  "0-0": { subject: "Lập trình Web", room: "A101", lecturer: "TS. Nguyễn Văn An", color: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-200" },
  "1-1": { subject: "Toán cao cấp", room: "B203", lecturer: "GS. Phạm Quốc Dũng", color: "bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-950/50 dark:border-violet-700 dark:text-violet-200" },
  "2-2": { subject: "Cơ sở dữ liệu", room: "A203", lecturer: "TS. Hoàng Thị Em", color: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-200" },
  "3-0": { subject: "Mạng máy tính", room: "Lab 2", lecturer: "ThS. Lê Minh Cường", color: "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-200" },
  "4-3": { subject: "Tiếng Anh", room: "C105", lecturer: "ThS. Vũ Đình Phúc", color: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-200" },
  "5-1": { subject: "Vật lý đại cương", room: "B101", lecturer: "PGS. Trần Thị Bích", color: "bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-950/50 dark:border-cyan-700 dark:text-cyan-200" },
  "1-4": { subject: "Lập trình Web", room: "A101", lecturer: "TS. Nguyễn Văn An", color: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-200" },
  "3-3": { subject: "Cơ sở dữ liệu", room: "A203", lecturer: "TS. Hoàng Thị Em", color: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-200" },
};

export default function ThoiKhoaBieuPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - baseDate.getDay() + 1);
  const weekLabel = `Tuần ${weekOffset === 0 ? "này" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thời khóa biểu</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Lớp K22CNTT — Học kỳ 2, Năm học 2025–2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[80px] text-center text-sm font-semibold text-gray-700 dark:text-gray-300">{weekLabel}</span>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="w-28 px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">Tiết</th>
              {days.map((d, i) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <th key={d} className="px-2 py-3 text-center">
                    <span className={`block text-xs font-bold uppercase ${isToday ? "text-lime-600 dark:text-lime-400" : "text-gray-500 dark:text-gray-400"}`}>{d}</span>
                    <span className={`block text-[10px] ${isToday ? "text-lime-500" : "text-gray-400"}`}>{date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {periods.map((period, pIdx) => (
              <tr key={pIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3">
                  {period.split("\n").map((line, i) => (
                    <p key={i} className={i === 0 ? "text-xs font-bold text-gray-700 dark:text-gray-300" : "text-[10px] text-gray-400"}>{line}</p>
                  ))}
                </td>
                {days.map((_, dIdx) => {
                  const cell = schedule[`${dIdx}-${pIdx}`];
                  return (
                    <td key={dIdx} className="px-1.5 py-2">
                      {cell ? (
                        <div className={`rounded-xl border p-2 ${cell.color}`}>
                          <p className="text-[11px] font-semibold leading-tight">{cell.subject}</p>
                          <p className="mt-1 text-[10px] opacity-70">{cell.room}</p>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
