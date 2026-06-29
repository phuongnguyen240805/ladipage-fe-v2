import React, { useState, useEffect } from 'react';
import { scheduleAdjustmentApi, ScheduleAdjustmentSubmitRequest } from '@/features/education/api/schedule-adjustment';
import { toast } from 'sonner';
import { X, Loader2, CalendarRange } from 'lucide-react';
import { timeSlotApi } from '@/features/education/api/timeSlot';
import { roomApi } from '@/features/education/api/room';
import { scheduleApi } from '@/features/education/api/schedule';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: any; // { id, courseClassId, courseClassName, date, ... }
  onSuccess: () => void;
}

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export default function AdjustmentModal({ isOpen, onClose, eventData, onSuccess }: AdjustmentModalProps) {
  const [courseClassId, setCourseClassId] = useState('');
  const [absentDate, setAbsentDate] = useState('');
  const [absentTimeSlotId, setAbsentTimeSlotId] = useState('');
  const [absentPeriods, setAbsentPeriods] = useState(3);

  const [requestType, setRequestType] = useState<'ABSENT_MAKEUP' | 'EXTRA_SESSION' | 'RESCHEDULE' | 'ROOM_CHANGE'>('ABSENT_MAKEUP');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTimeSlotId, setProposedTimeSlotId] = useState('');
  const [proposedRoomId, setProposedRoomId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  useEffect(() => {
    if (isOpen) {
      timeSlotApi.getAll().then(res => setTimeSlots(toArray(res)));
      roomApi.getAll().then(res => setRooms(toArray(res)));
      scheduleApi.getTeachingProgress().then(res => setMyClasses(toArray(res)));
      
      if (eventData) {
        setCourseClassId(eventData.courseClassId);
        setAbsentDate(eventData.date);
        setAbsentTimeSlotId(eventData.timeSlotId);
        setAbsentPeriods(eventData.periods || 3);
      } else {
        setCourseClassId('');
        setAbsentDate('');
        setAbsentTimeSlotId('');
        setAbsentPeriods(3);
      }
      
      setType(eventData?.requestType || 'ABSENT_MAKEUP');
      setProposedDate(eventData?.proposedDate || '');
      setProposedTimeSlotId(eventData?.proposedTimeSlotId || '');
      setProposedRoomId(eventData?.proposedRoomId || '');
      setReason('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (courseClassId && !eventData) {
      scheduleApi.getByCourseClass(courseClassId).then(res => {
        setSchedules(toArray(res));
      });
    } else {
      setSchedules([]);
    }
    setSelectedScheduleId('');
  }, [courseClassId, eventData]);

  useEffect(() => {
    if (selectedScheduleId) {
      const selected = schedules.find(s => s.scheduleId === selectedScheduleId);
      if (selected) {
        setAbsentDate(selected.date);
        setAbsentTimeSlotId(selected.timeSlotId);
        setAbsentPeriods(selected.numberOfPeriods || 3);
      }
    } else if (!eventData) {
      setAbsentDate('');
      setAbsentTimeSlotId('');
      setAbsentPeriods(3);
    }
  }, [selectedScheduleId, schedules, eventData]);

  const type = requestType;
  const setType = setRequestType;
  const newDate = proposedDate;
  const setNewDate = setProposedDate;
  const newTimeSlotId = proposedTimeSlotId;
  const setNewTimeSlotId = setProposedTimeSlotId;
  const newRoomId = proposedRoomId;
  const setNewRoomId = setProposedRoomId;
  
  const needsProposedForm = true; 

  if (!isOpen) return null;

  const handleValidate = async () => {
    if (!proposedDate || !proposedTimeSlotId || !proposedRoomId) {
      toast.error('Vui lòng điền đủ Ngày, Ca, Phòng học mới');
      return false;
    }
    
    setIsValidating(true);
    try {
      const activeCourseClassId = eventData ? eventData.courseClassId : courseClassId;
      const activeOriginalScheduleId = eventData ? (eventData.originalScheduleId || eventData.scheduleId || eventData.id) : (selectedScheduleId || undefined);
      
      const res = await scheduleAdjustmentApi.validate({
        courseClassId: activeCourseClassId,
        originalScheduleId: activeOriginalScheduleId,
        requestType,
        absentDate: requestType === 'EXTRA_SESSION' ? undefined : absentDate || undefined,
        absentTimeSlotId: requestType === 'EXTRA_SESSION' ? undefined : absentTimeSlotId || undefined,
        absentPeriods: requestType === 'EXTRA_SESSION' ? undefined : absentPeriods || undefined,
        proposedDate,
        proposedTimeSlotId,
        proposedRoomId,
        proposedPeriods: requestType === 'EXTRA_SESSION' ? 3 : absentPeriods
      });
      const data = res.data?.data || res.data;
      if (data?.valid) {
        toast.success('Lịch hợp lệ, bạn có thể gửi yêu cầu!');
        return true;
      } else {
        const errorMessages = data?.results
          ?.filter((result: any) => result.status === 'ERROR')
          .map((result: any) => result.message)
          .filter(Boolean);
        toast.error(errorMessages?.length ? errorMessages.join(', ') : 'Lịch chưa hợp lệ, vui lòng kiểm tra lại');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi kiểm tra lịch');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    const isValid = await handleValidate();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const activeCourseClassId = eventData ? eventData.courseClassId : courseClassId;
      const activeOriginalScheduleId = eventData ? (eventData.originalScheduleId || eventData.scheduleId || eventData.id) : (selectedScheduleId || undefined);

      await scheduleAdjustmentApi.submit({
        courseClassId: activeCourseClassId,
        originalScheduleId: activeOriginalScheduleId,
        requestType,
        absentDate: requestType === 'EXTRA_SESSION' ? undefined : absentDate || undefined,
        absentTimeSlotId: requestType === 'EXTRA_SESSION' ? undefined : absentTimeSlotId || undefined,
        absentPeriods: requestType === 'EXTRA_SESSION' ? undefined : absentPeriods || undefined,
        proposedDate,
        proposedTimeSlotId,
        proposedRoomId,
        proposedPeriods: requestType === 'EXTRA_SESSION' ? 3 : absentPeriods,
        reason
      });
      toast.success('Đã gửi yêu cầu thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold">
            <CalendarRange className="w-5 h-5" />
            <h2>Yêu cầu Điều chỉnh Lịch</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {eventData ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Lớp học phần đang chọn:</p>
              <p className="font-semibold">{eventData.courseClassName}</p>
              <p className="text-sm mt-1">Lịch cũ: <span className="font-medium text-amber-600">{eventData.date}</span></p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Lớp học phần</label>
                <select
                  value={courseClassId}
                  onChange={e => setCourseClassId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm bg-white dark:bg-slate-900"
                >
                  <option value="">-- Chọn lớp học phần --</option>
                  {myClasses.map((c: any) => (
                    <option key={c.courseClassId} value={c.courseClassId}>
                      {c.courseClassCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              {requestType !== 'EXTRA_SESSION' && courseClassId && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Buổi học cần điều chỉnh</label>
                  <select
                    value={selectedScheduleId}
                    onChange={e => setSelectedScheduleId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm bg-white dark:bg-slate-900"
                  >
                    <option value="">-- Chọn buổi học --</option>
                    {schedules.map((s: any) => (
                      <option key={s.scheduleId} value={s.scheduleId}>
                        Ngày {s.date} (Ca {s.slotCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Loại yêu cầu</label>
            <select 
              value={requestType} 
              onChange={e => setRequestType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm bg-white dark:bg-slate-900"
            >
              <option value="ABSENT_MAKEUP">Nghỉ và dạy bù</option>
              <option value="RESCHEDULE">Đổi lịch</option>
              <option value="ROOM_CHANGE">Đổi phòng</option>
              <option value="EXTRA_SESSION">Tăng tiết / Học thêm</option>
            </select>
          </div>

          {needsProposedForm && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20">
              <div className="col-span-2 text-sm font-semibold text-emerald-600 mb-1">Lịch dự kiến thay thế:</div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium opacity-70">Ngày mới</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium opacity-70">Ca mới</label>
                <select 
                  value={newTimeSlotId} 
                  onChange={e => setNewTimeSlotId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Chọn ca --</option>
                  {timeSlots.map(s => <option key={s.timeSlotId} value={s.timeSlotId}>{s.slotCode}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium opacity-70">Phòng mới</label>
                <select 
                  value={newRoomId} 
                  onChange={e => setNewRoomId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.roomId || r.id} value={r.roomId || r.id}>{r.code}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Lý do</label>
            <textarea 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              placeholder="Nhập lý do xin nghỉ/đổi lịch..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent min-h-[80px] text-sm bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          
          {needsProposedForm && (
            <button 
              onClick={handleValidate}
              disabled={isValidating}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 transition-colors flex items-center gap-2"
            >
              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Kiểm tra
            </button>
          )}

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium rounded-xl bg-[#009640] text-white hover:bg-[#008137] transition-colors flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Gửi yêu cầu
          </button>
        </div>

      </div>
    </div>
  );
}
