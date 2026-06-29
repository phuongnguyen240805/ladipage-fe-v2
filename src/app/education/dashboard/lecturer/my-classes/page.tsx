'use client';

import React from 'react';
import LecturerClassList from '@/features/education/components/ems/lecturer/LecturerClassList';

export default function LecturerMyClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lớp của tôi</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi lớp học phần, tiến độ giảng dạy và khối lượng còn lại theo từng học kỳ.</p>
      </div>

      <LecturerClassList />
    </div>
  );
}
