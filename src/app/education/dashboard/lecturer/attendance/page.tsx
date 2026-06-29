'use client';

import React from 'react';
import LecturerAttendance from '@/features/education/components/ems/lecturer/LecturerAttendance';

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Điểm danh & Tiến độ</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Cập nhật tiến độ giảng dạy và điểm danh sinh viên tham gia lớp học.</p>
      </div>

      <LecturerAttendance />
    </div>
  );
}