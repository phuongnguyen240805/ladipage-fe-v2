"use client";

import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { scheduleApi } from "@/features/education/api/schedule";
import { BookOpen, Clock, MapPin } from 'lucide-react';
import { toast } from "sonner";
import AdjustmentModal from './AdjustmentModal';
import { useAuth } from '@/features/education/context/AuthContext';
import { request } from '@/features/education/utils/request';

export default function LecturerSchedule() {
  const { user, updateUser } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(user?.id || null);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (user?.id) {
      setEmployeeId(user.id);
      return;
    }
    if (!user) return;
    console.log('[LecturerSchedule] user.id missing, fetching from /me...');
    request.get('/api/auth/me').then((res: any) => {
      console.log('[LecturerSchedule] /me response:', res);
      const empId = res?.data?.employeeId;
      console.log('[LecturerSchedule] empId from /me:', empId);
      if (empId) {
        setEmployeeId(empId);
        updateUser({ id: empId });
      }
    }).catch(() => {});
  }, [user?.id]);

  const fetchScheduleForRange = async (start: Date, end: Date) => {
    if (!employeeId) return;

    const midDate = new Date((start.getTime() + end.getTime()) / 2);
    const month = midDate.getMonth() + 1;
    const year = midDate.getFullYear();

    try {
      const res = await scheduleApi.getCalendar({
        instructorId: employeeId,
        month: month,
        year: year
      });
      console.log('[LecturerSchedule] calling calendar API:', { employeeId, month, year });
      const calendarDays = res?.data || [];
      console.log('[LecturerSchedule] calendarDays received:', calendarDays.length, 'days, events:', calendarDays.filter((d: any) => d.items?.length > 0));
      const scheduleEvents: any[] = [];

      calendarDays.forEach((day: any) => {
        day.items.forEach((item: any) => {
          const start = item.startTime ? `${day.date}T${item.startTime}` : `${day.date}T07:00:00`;
          const end = item.endTime ? `${day.date}T${item.endTime}` : `${day.date}T10:00:00`;

          scheduleEvents.push({
            id: item.id,
            title: `${item.courseClassCode} - ${item.roomCode || ''}`,
            start,
            end,
            extendedProps: {
              ...item,
              date: day.date,
              periods: item.numberOfPeriods || 3
            }
          });
        });
      });
      setEvents(scheduleEvents);
    } catch (error) {
      console.error("Lỗi khi tải lịch dạy", error);
      toast.error("Không thể tải lịch giảng dạy");
    }
  };

  useEffect(() => {
    if (currentRange && employeeId) {
      fetchScheduleForRange(currentRange.start, currentRange.end);
    }
  }, [employeeId, currentRange]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const isPractical = eventInfo.event.extendedProps.mode === 'TH';
    const hasRoom = !!eventInfo.event.extendedProps.roomCode;
    const modeLabel = isPractical ? 'THỰC HÀNH' : 'LÝ THUYẾT';
    const startTime = eventInfo.event.start?.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTime = eventInfo.event.end?.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const palette = !hasRoom
      ? {
          card: 'bg-slate-100/80 border-slate-400 text-slate-700 dark:bg-slate-800/80 dark:border-slate-500 dark:text-slate-200 opacity-80',
          room: 'bg-slate-500 text-white',
          chip: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
          meta: 'text-slate-500 dark:text-slate-300',
        }
      : isPractical
        ? {
            card: 'bg-amber-50/95 border-amber-600 text-amber-950 dark:bg-amber-950/40 dark:border-amber-400 dark:text-amber-100',
            room: 'bg-amber-600 text-white',
            chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
            meta: 'text-amber-700 dark:text-amber-200',
          }
        : {
            card: 'bg-emerald-50/95 border-emerald-600 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-100',
            room: 'bg-emerald-600 text-white',
            chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
            meta: 'text-emerald-700 dark:text-emerald-200',
          };

    return (
      <div className={`group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border-l-4 p-3 shadow-sm transition-all hover:shadow-md ${palette.card}`}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className={`max-w-[54%] truncate rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none shadow-sm ${palette.room}`}>
            {eventInfo.event.extendedProps.roomCode || 'CHƯA XẾP'}
          </span>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold leading-none ${palette.chip}`}>
            {modeLabel}
          </span>
        </div>
        <div className="mb-1 line-clamp-2 text-xs font-bold leading-snug">
          {eventInfo.event.extendedProps.courseClassName || eventInfo.event.extendedProps.courseClassCode}
        </div>
        <div className="mb-2 line-clamp-2 text-[10px] leading-snug opacity-80">
          {eventInfo.event.extendedProps.courseName || 'Tên môn học'}
        </div>
        <div className={`mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold ${palette.meta}`}>
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{eventInfo.event.extendedProps.roomName || eventInfo.event.extendedProps.roomCode || 'Chưa có phòng học'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {startTime}{endTime ? ` - ${endTime}` : ''}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={13} />
            {eventInfo.event.extendedProps.periods || 3} tiết
          </span>
        </div>
      </div>
    );
  };

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTimeValue = (date?: Date | null) => {
    if (!date) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="lecturer-schedule-calendar flex w-full flex-col overflow-x-auto rounded-2xl border border-emerald-100 bg-[#f7f9ff] p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950 md:p-6">
      <div className="min-w-[860px] rounded-2xl border border-emerald-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          datesSet={(dateInfo) => {
            setCurrentRange(prev => {
              if (prev && prev.start.getTime() === dateInfo.start.getTime() && prev.end.getTime() === dateInfo.end.getTime()) {
                return prev;
              }
              return { start: dateInfo.start, end: dateInfo.end };
            });
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventContent={renderEventContent}
          eventDisplay="block"
          editable
          eventDurationEditable={false}
          eventAllow={(dropInfo, draggedEvent) => !!draggedEvent && getTimeValue(dropInfo.start) === getTimeValue(draggedEvent.start)}
          eventDrop={(info) => {
            const props = info.event.extendedProps;
            const proposedDate = info.event.start ? formatDateValue(info.event.start) : '';

            info.revert();

            if (!proposedDate || proposedDate === props.date) {
              return;
            }

            setSelectedEvent({
              originalScheduleId: info.event.id,
              courseClassId: props.courseClassId,
              courseClassName: props.courseClassName,
              date: props.date,
              timeSlotId: props.timeSlotId,
              periods: props.periods || 3,
              roomCode: props.roomCode,
              requestType: 'RESCHEDULE',
              proposedDate,
              proposedTimeSlotId: props.timeSlotId,
              proposedRoomId: props.roomId,
            });
            toast.info('Đã chọn ngày mới, vui lòng nhập lý do để gửi yêu cầu đổi lịch');
          }}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
          allDaySlot={false}
          hiddenDays={[0]}
          height="800px"
          nowIndicator
          dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: 'numeric' }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          locale="vi"
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày'
          }}
          eventClick={(info) => {
            const props = info.event.extendedProps;
            setSelectedEvent({
              originalScheduleId: info.event.id,
              courseClassId: props.courseClassId,
              courseClassName: props.courseClassName,
              date: info.event.startStr.split('T')[0],
              timeSlotId: props.timeSlotId,
              periods: props.periods || 3,
              roomCode: props.roomCode
            });
          }}
        />
      </div>
      <style jsx global>{`
        .lecturer-schedule-calendar .fc {
          --fc-border-color: #dbe7e2;
          --fc-today-bg-color: rgba(16, 185, 129, 0.08);
          color: #0f172a;
          font-family: inherit;
        }

        .dark .lecturer-schedule-calendar .fc {
          --fc-border-color: #334155;
          --fc-today-bg-color: rgba(52, 211, 153, 0.1);
          color: #e2e8f0;
        }

        .lecturer-schedule-calendar .fc .fc-toolbar.fc-header-toolbar {
          align-items: center;
          gap: 1rem;
          margin: 0;
          padding: 1.5rem;
        }

        .lecturer-schedule-calendar .fc-toolbar-title {
          color: #0f172a;
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          letter-spacing: 0;
        }

        .dark .lecturer-schedule-calendar .fc-toolbar-title {
          color: #f8fafc;
        }

        .lecturer-schedule-calendar .fc-button-group {
          gap: 0.25rem;
          border: 1px solid #dbe7e2;
          border-radius: 0.75rem;
          background: #edf4ff;
          padding: 0.25rem;
        }

        .dark .lecturer-schedule-calendar .fc-button-group {
          border-color: #334155;
          background: #0f172a;
        }

        .lecturer-schedule-calendar .fc .fc-button {
          height: 2.5rem;
          border: 0 !important;
          border-radius: 0.5rem !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #475569 !important;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: none;
        }

        .lecturer-schedule-calendar .fc .fc-button:hover {
          background: #d9eaff !important;
          color: #0f172a !important;
        }

        .lecturer-schedule-calendar .fc .fc-button-active {
          background: #ffffff !important;
          color: #059669 !important;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12) !important;
        }

        .dark .lecturer-schedule-calendar .fc .fc-button {
          color: #cbd5e1 !important;
        }

        .dark .lecturer-schedule-calendar .fc .fc-button:hover,
        .dark .lecturer-schedule-calendar .fc .fc-button-active {
          background: #1e293b !important;
          color: #34d399 !important;
        }

        .lecturer-schedule-calendar .fc .fc-today-button {
          border: 1px solid #dbe7e2 !important;
          border-radius: 0.75rem !important;
          background: #ffffff !important;
          padding: 0.55rem 1.25rem !important;
          color: #0f172a !important;
        }

        .dark .lecturer-schedule-calendar .fc .fc-today-button {
          border-color: #334155 !important;
          background: #0f172a !important;
          color: #e2e8f0 !important;
        }

        .lecturer-schedule-calendar .fc-theme-standard .fc-scrollgrid {
          border: 0;
          border-top: 1px solid var(--fc-border-color);
        }

        .lecturer-schedule-calendar .fc-theme-standard th {
          background: #edf4ff;
          border-color: var(--fc-border-color) !important;
          text-align: center !important;
        }

        .dark .lecturer-schedule-calendar .fc-theme-standard th {
          background: #0f172a;
        }

        .lecturer-schedule-calendar .fc .fc-col-header-cell-cushion {
          display: block;
          padding: 0.85rem 0.5rem !important;
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .lecturer-schedule-calendar .fc .fc-day-today .fc-col-header-cell-cushion {
          color: #059669;
        }

        .lecturer-schedule-calendar .fc-timegrid-axis {
          background: #ffffff;
        }

        .dark .lecturer-schedule-calendar .fc-timegrid-axis {
          background: #0f172a;
        }

        .lecturer-schedule-calendar .fc-timegrid-slot {
          height: 100px;
        }

        .lecturer-schedule-calendar .fc-direction-ltr .fc-timegrid-slot-label-frame,
        .lecturer-schedule-calendar .fc .fc-timegrid-axis-cushion {
          padding: 0.5rem 0.75rem !important;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 800;
        }

        .dark .lecturer-schedule-calendar .fc-direction-ltr .fc-timegrid-slot-label-frame,
        .dark .lecturer-schedule-calendar .fc .fc-timegrid-axis-cushion {
          color: #cbd5e1;
        }

        .lecturer-schedule-calendar .fc-v-event,
        .lecturer-schedule-calendar .fc-h-event {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .lecturer-schedule-calendar .fc-timegrid-event,
        .lecturer-schedule-calendar .fc-daygrid-event {
          margin: 3px 4px;
        }

        .lecturer-schedule-calendar .fc-event-main {
          height: 100%;
          color: inherit !important;
        }

        .lecturer-schedule-calendar .fc-timegrid-now-indicator-line {
          border-color: #059669;
        }

        .lecturer-schedule-calendar .fc-timegrid-now-indicator-arrow {
          border-left-color: #059669;
          border-right-color: #059669;
        }

        @media (max-width: 767px) {
          .lecturer-schedule-calendar .fc .fc-toolbar.fc-header-toolbar {
            align-items: stretch;
            padding: 1rem;
          }

          .lecturer-schedule-calendar .fc-toolbar-title {
            text-align: center;
          }
        }
      `}</style>
      <AdjustmentModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        eventData={selectedEvent}
        onSuccess={() => {
          if (currentRange) fetchScheduleForRange(currentRange.start, currentRange.end);
        }}
      />
    </div>
  );
}
