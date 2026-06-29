'use client';

import React from 'react';
import LecturerRoomInfo from '@/features/education/components/ems/lecturer/LecturerRoomInfo';

export default function RoomInfoPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông tin phòng học</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Tra cứu thông tin sức chứa và trang thiết bị của phòng học.</p>
      </div>

      <LecturerRoomInfo />
    </div>
  );
}
