'use client';

import React, { useEffect, useState } from 'react';
import { scheduleAdjustmentApi } from '@/features/education/api/schedule-adjustment';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/features/education/components/ui/badge';
import AdjustmentModal from '@/features/education/components/ems/lecturer/AdjustmentModal';

export default function LecturerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await scheduleAdjustmentApi.getMine();
      setRequests(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Chờ duyệt</Badge>;
      case 'APPROVED': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Đã duyệt</Badge>;
      case 'REJECTED': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Từ chối</Badge>;
      case 'RETURNED': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Yêu cầu sửa</Badge>;
      case 'CONFLICT_DETECTED': return <Badge className="bg-red-500/10 text-red-600 border-red-200">Có xung đột</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ABSENT_MAKEUP': return 'Nghỉ và Dạy bù';
      case 'EXTRA_SESSION': return 'Tăng tiết';
      case 'RESCHEDULE': return 'Đổi lịch';
      case 'ROOM_CHANGE': return 'Đổi phòng';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yêu cầu Điều chỉnh lịch</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý các đơn xin nghỉ, báo bù, đổi giờ của bạn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors shadow-sm"
        >
          <span className="text-lg">+</span>
          Tạo yêu cầu mới
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Loại yêu cầu</th>
                <th className="px-6 py-4">Lịch cũ</th>
                <th className="px-6 py-4">Đề xuất mới</th>
                <th className="px-6 py-4">Lý do</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ghi chú của Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <FileText className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    Chưa có yêu cầu nào
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.requestId} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{getTypeLabel(req.requestType)}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {req.absentDate ? <>{req.absentDate}<br/><span className="text-xs opacity-70">Ca: {req.absentTimeSlotId}</span></> : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {req.proposedDate ? <>{req.proposedDate}<br/><span className="text-xs opacity-70">Ca: {req.proposedTimeSlotId}</span></> : '-'}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={req.adminNote}>{req.adminNote || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdjustmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventData={null}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
