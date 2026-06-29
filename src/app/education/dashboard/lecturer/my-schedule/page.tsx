'use client';

import dynamic from 'next/dynamic';

const LecturerSchedule = dynamic(() => import('@/features/education/components/ems/lecturer/LecturerSchedule'), {
  ssr: false,
});

export default function LecturerMySchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lịch giảng dạy</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Xem và quản lý lịch trình giảng dạy hàng tuần của bạn.</p>
      </div>

      <LecturerSchedule />
    </div>
  );
}
