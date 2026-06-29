"use client";
import React, { useState, useEffect } from 'react';
import { roomApi } from '@/features/education/api/room';
import { MapPin, Users, Monitor, Wind, DoorOpen, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function LecturerRoomInfo() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Thay the roomApi.getAll() bằng gọi API thực tế nếu có
        // const res = await roomApi.getAll();
        // const fetchedRooms = res.data?.data || res.data || [];
        
        const fetchedRooms: any[] = []; // Tạm giả định API trả về rỗng vì giảng viên chưa có room API riêng
        setRooms(fetchedRooms);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin phòng học");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Đang tải dữ liệu phòng học...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {rooms.map((room, idx) => (
        <div key={room.id || idx} className="group bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl shadow-sm hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-500/50 transition-all duration-300 overflow-hidden relative flex flex-col">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <DoorOpen size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Phòng {room.roomCode || "Chưa có mã"}
                </h3>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} /> {room.buildingName || "Khu A"}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Users size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sức chứa</div>
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{room.capacity || 40} sinh viên</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                room.status === 'ACTIVE' || !room.status ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              }`}>
                {room.status === 'ACTIVE' || !room.status ? 'Sẵn sàng' : 'Bảo trì'}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100/50 dark:border-gray-800/50 mt-auto">
             <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Trang thiết bị</div>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <Monitor size={16} className="text-brand-500" /> Máy chiếu
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <Wind size={16} className="text-sky-500" /> Điều hòa
                </div>
             </div>
          </div>
        </div>
      ))}
      
      {rooms.length === 0 && !loading && (
        <div className="col-span-full py-10 flex flex-col items-center justify-center bg-white/40 dark:bg-gray-900/20 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Info size={40} className="text-gray-400 mb-2" />
          <p className="text-gray-500 font-medium">Chưa có dữ liệu phòng học</p>
        </div>
      )}
    </div>
  );
}
