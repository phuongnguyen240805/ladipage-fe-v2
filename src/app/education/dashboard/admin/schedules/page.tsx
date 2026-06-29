'use client';

import dynamic from 'next/dynamic';

const TimetableBuilder = dynamic(() => import('@/features/education/components/ems/TimetableBuilder'), {
  ssr: false,
});

export default function AdminSchedulesPage() {
  return (
    <div className="space-y-6 text-[14px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[14px] font-bold text-slate-900 dark:text-white">Quản lý Thời khóa biểu</h1>
          <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
            Sắp xếp lịch học, phân công giảng viên bằng cách kéo thả lớp học.
          </p>
        </div>
      </div>

      <TimetableBuilder />
    </div>
  );
}
