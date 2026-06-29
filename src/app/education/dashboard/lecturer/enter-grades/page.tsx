'use client';

import React from 'react';
import LecturerEnterGrades from '@/features/education/components/ems/lecturer/LecturerEnterGrades';

export default function GradeInputPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nhập điểm</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Nhập và quản lý điểm số của sinh viên theo từng lớp học phần.</p>
      </div>

      <LecturerEnterGrades />
    </div>
  );
}