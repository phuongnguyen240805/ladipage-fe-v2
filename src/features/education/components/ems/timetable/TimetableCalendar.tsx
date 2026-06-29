import React from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { EventReceiveArg } from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg, EventContentArg } from "@fullcalendar/core";
import { BookOpen, Clock, MapPin, Users } from 'lucide-react';

interface Props {
  events: any[];
  calendarRef: React.RefObject<FullCalendar | null>;
  onDateSelect: (info: DateSelectArg) => void;
  onEventClick: (info: EventClickArg) => void;
  onEventReceive: (info: EventReceiveArg) => void;
  onEventDrop?: (info: any) => void;
  onEventResize?: (info: any) => void;
}

export default function TimetableCalendar({
  events,
  calendarRef,
  onDateSelect,
  onEventClick,
  onEventReceive,
  onEventDrop,
  onEventResize
}: Props) {
  const renderEventContent = (eventInfo: EventContentArg) => {
    const isConflict = eventInfo.event.extendedProps.isConflict === true;
    const isPractical = eventInfo.event.extendedProps.calendar === 'Warning' || eventInfo.event.extendedProps.mode === 'TH';
    const hasRoom = !!eventInfo.event.extendedProps.roomCode;
    const modeLabel = isPractical ? 'THỰC HÀNH' : 'LÝ THUYẾT';

    let palette = {
      card: 'bg-emerald-50/95 border-emerald-600 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-100',
      room: 'bg-emerald-600 text-white',
      chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
      meta: 'text-emerald-700 dark:text-emerald-200',
    };

    if (isConflict) {
      palette = {
        card: 'bg-red-50/95 border-red-600 text-red-950 dark:bg-red-950/40 dark:border-red-400 dark:text-red-100',
        room: 'bg-red-600 text-white',
        chip: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200',
        meta: 'text-red-700 dark:text-red-200',
      };
    } else if (!hasRoom) {
      palette = {
        card: 'bg-slate-100/80 border-slate-400 text-slate-700 dark:bg-slate-800/80 dark:border-slate-500 dark:text-slate-200 opacity-80',
        room: 'bg-slate-500 text-white',
        chip: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
        meta: 'text-slate-500 dark:text-slate-300',
      };
    } else if (isPractical) {
      palette = {
        card: 'bg-amber-50/95 border-amber-600 text-amber-950 dark:bg-amber-950/40 dark:border-amber-400 dark:text-amber-100',
        room: 'bg-amber-600 text-white',
        chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
        meta: 'text-amber-700 dark:text-amber-200',
      };
    }

    return (
      <div className={`group flex h-full w-full cursor-grab flex-col overflow-hidden rounded-lg border-l-4 p-2 text-[14px] shadow-sm transition-all hover:shadow-md active:cursor-grabbing 2xl:p-3 ${palette.card}`}>
        <div className="mb-1.5 flex items-start justify-between gap-1.5 2xl:mb-2 2xl:gap-2">
          <span className={`max-w-[54%] truncate rounded-full px-2 py-1 text-[13px] font-semibold uppercase leading-none shadow-sm 2xl:px-2.5 ${palette.room}`}>
            {eventInfo.event.extendedProps.roomCode || 'CHƯA XẾP'}
          </span>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[13px] font-semibold leading-none ${palette.chip}`}>
            {isConflict ? 'TRÙNG LỊCH' : modeLabel}
          </span>
        </div>

        <div className="mb-1 line-clamp-2 text-[14px] font-semibold leading-snug">
          {eventInfo.event.extendedProps.courseClassName || eventInfo.event.title}
        </div>

        <div className={`mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold 2xl:gap-x-3 ${palette.meta}`}>
          {eventInfo.event.extendedProps.instructorName ? (
            <span className="flex min-w-0 items-center gap-1">
              <Users size={13} className="shrink-0" />
              <span className="truncate">{eventInfo.event.extendedProps.instructorName}</span>
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{eventInfo.event.extendedProps.roomCode || 'Chưa có phòng học'}</span>
          </span>
          {eventInfo.timeText ? (
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {eventInfo.timeText}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <BookOpen size={13} />
            {eventInfo.event.extendedProps.numberOfPeriods || 2} tiết
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-timetable-calendar flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-emerald-100 bg-[#f7f9ff] p-2 text-[14px] shadow-sm dark:border-slate-700 dark:bg-slate-950 md:p-3 2xl:p-4">
      <div className="min-w-[720px] flex-1 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:min-w-0">
        <FullCalendar
          ref={calendarRef as React.RefObject<FullCalendar>}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          droppable={true}
          editable={true}
          eventStartEditable={true}
          eventDurationEditable={true}
          select={onDateSelect}
          eventClick={onEventClick}
          eventReceive={onEventReceive}
          eventDrop={onEventDrop}
          eventResize={onEventResize}
          eventContent={renderEventContent}
          eventDisplay="block"
          slotMinTime="07:00:00"
          slotMaxTime="21:30:00"
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
          allDaySlot={false}
          height="100%"
          nowIndicator
          locale="vi"
          dayHeaderFormat={{ weekday: 'short', day: '2-digit', month: 'numeric' }}
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày'
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>
      <style jsx global>{`
        .admin-timetable-calendar .fc {
          --fc-border-color: #dbe7e2;
          --fc-today-bg-color: rgba(16, 185, 129, 0.08);
          color: #0f172a;
          font-family: inherit;
        }

        .dark .admin-timetable-calendar .fc {
          --fc-border-color: #334155;
          --fc-today-bg-color: rgba(52, 211, 153, 0.1);
          color: #e2e8f0;
        }

        .admin-timetable-calendar .fc .fc-toolbar.fc-header-toolbar {
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin: 0;
          padding: clamp(0.75rem, 1.2vw, 1.5rem);
        }

        .admin-timetable-calendar .fc .fc-toolbar-chunk {
          display: flex;
          min-width: 0;
          align-items: center;
        }

        .admin-timetable-calendar .fc-toolbar-title {
          color: #0f172a;
          font-size: 14px !important;
          font-weight: 600 !important;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .dark .admin-timetable-calendar .fc-toolbar-title {
          color: #f8fafc;
        }

        .admin-timetable-calendar .fc-button-group {
          gap: 0.25rem;
          border: 1px solid #dbe7e2;
          border-radius: 0.75rem;
          background: #edf4ff;
          padding: 0.25rem;
        }

        .dark .admin-timetable-calendar .fc-button-group {
          border-color: #334155;
          background: #0f172a;
        }

        .admin-timetable-calendar .fc .fc-button {
          height: clamp(2.15rem, 2.2vw, 2.5rem);
          border: 0 !important;
          border-radius: 0.5rem !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #475569 !important;
          font-size: 14px;
          font-weight: 500;
          text-transform: none;
        }

        .admin-timetable-calendar .fc .fc-button:hover {
          background: #d9eaff !important;
          color: #0f172a !important;
        }

        .admin-timetable-calendar .fc .fc-button-active {
          background: #ffffff !important;
          color: #059669 !important;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12) !important;
        }

        .dark .admin-timetable-calendar .fc .fc-button {
          color: #cbd5e1 !important;
        }

        .dark .admin-timetable-calendar .fc .fc-button:hover,
        .dark .admin-timetable-calendar .fc .fc-button-active {
          background: #1e293b !important;
          color: #34d399 !important;
        }

        .admin-timetable-calendar .fc .fc-today-button {
          border: 1px solid #dbe7e2 !important;
          border-radius: 0.75rem !important;
          background: #ffffff !important;
          padding: 0.5rem clamp(0.75rem, 1vw, 1.25rem) !important;
          color: #0f172a !important;
        }

        .dark .admin-timetable-calendar .fc .fc-today-button {
          border-color: #334155 !important;
          background: #0f172a !important;
          color: #e2e8f0 !important;
        }

        .admin-timetable-calendar .fc-theme-standard .fc-scrollgrid {
          border: 0;
          border-top: 1px solid var(--fc-border-color);
        }

        .admin-timetable-calendar .fc-theme-standard th {
          background: #edf4ff;
          border-color: var(--fc-border-color) !important;
          text-align: center !important;
        }

        .dark .admin-timetable-calendar .fc-theme-standard th {
          background: #0f172a;
        }

        .admin-timetable-calendar .fc .fc-col-header-cell-cushion {
          display: block;
          padding: clamp(0.55rem, 0.8vw, 0.85rem) 0.35rem !important;
          color: #64748b;
          font-size: 13px;
          font-weight: 650;
          text-transform: none;
        }

        .admin-timetable-calendar .fc .fc-day-today .fc-col-header-cell-cushion {
          color: #059669;
        }

        .admin-timetable-calendar .fc-timegrid-axis {
          background: #ffffff;
          width: 64px !important;
        }

        .dark .admin-timetable-calendar .fc-timegrid-axis {
          background: #0f172a;
        }

        .admin-timetable-calendar .fc .fc-timegrid-slot-label {
          width: 64px !important;
          background: #ffffff;
        }

        .dark .admin-timetable-calendar .fc .fc-timegrid-slot-label {
          background: #0f172a;
        }

        .admin-timetable-calendar .fc-timegrid-slot {
          height: clamp(74px, 5.2vw, 100px);
        }

        .admin-timetable-calendar .fc-direction-ltr .fc-timegrid-slot-label-frame,
        .admin-timetable-calendar .fc .fc-timegrid-axis-cushion {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          height: 100%;
          padding: 0.9rem 0.35rem 0 !important;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
        }

        .admin-timetable-calendar .fc .fc-timegrid-slot-label-cushion,
        .admin-timetable-calendar .fc .fc-timegrid-axis-cushion {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          background: #ffffff;
          padding: 0 0.25rem;
          line-height: 1.2;
        }

        .dark .admin-timetable-calendar .fc-direction-ltr .fc-timegrid-slot-label-frame,
        .dark .admin-timetable-calendar .fc .fc-timegrid-axis-cushion {
          color: #cbd5e1;
        }

        .dark .admin-timetable-calendar .fc .fc-timegrid-slot-label-cushion,
        .dark .admin-timetable-calendar .fc .fc-timegrid-axis-cushion {
          background: #0f172a;
        }

        .admin-timetable-calendar .fc-v-event,
        .admin-timetable-calendar .fc-h-event {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .admin-timetable-calendar .fc-timegrid-event,
        .admin-timetable-calendar .fc-daygrid-event {
          margin: 3px 4px;
        }

        .admin-timetable-calendar .fc-event-main {
          height: 100%;
          color: inherit !important;
        }

        .admin-timetable-calendar .fc-timegrid-now-indicator-line {
          border-color: #059669;
        }

        .admin-timetable-calendar .fc-timegrid-now-indicator-arrow {
          border-left-color: #059669;
          border-right-color: #059669;
        }

        @media (max-width: 767px) {
          .admin-timetable-calendar .fc .fc-toolbar.fc-header-toolbar {
            align-items: stretch;
            padding: 1rem;
          }

          .admin-timetable-calendar .fc-toolbar-title {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
