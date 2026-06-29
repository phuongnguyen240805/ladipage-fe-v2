"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/features/education/hooks/useModal";
import { Modal } from "@/features/education/components/ui/modal";
import { scheduleApi } from "@/features/education/api/schedule";
import { courseClassApi } from "@/features/education/api/course";
import { roomApi } from "@/features/education/api/room";
import { timeSlotApi } from "@/features/education/api/timeSlot";
import { lecturerApi } from "@/features/education/api/lecturer";
import { toast } from "sonner";
import { DatePicker } from "@/features/education/components/ui/date-picker";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    instructorName?: string;
    roomCode?: string;
    courseClassName?: string;
  };
}

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courseClasses, setCourseClasses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    courseClassId: "",
    roomId: "",
    timeSlotId: "",
    instructorId: "",
    date: "",
    numberOfPeriods: 2,
    semesterId: "77730894-3cf6-4f71-9c60-84ce2289c099", // Default semester ID
    note: "",
    mode: "LT",
    scheduleStatus: "PLANNED"
  });

  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const fetchInitialData = async () => {
    try {
      const [schedulesRes, classesRes, roomsRes, slotsRes, lecturersRes] = await Promise.all([
        scheduleApi.getAll(),
        courseClassApi.getAll(),
        roomApi.getAll(),
        timeSlotApi.getAll(),
        lecturerApi.getAll()
      ]);

      // Process schedules for calendar
      const scheduleEvents = toArray(schedulesRes).map((s: any) => ({
        id: s.scheduleId,
        title: `${s.courseClassName} - ${s.roomCode}`,
        start: s.date,
        allDay: true,
        extendedProps: {
          calendar: s.mode === 'TH' ? 'Warning' : 'Primary',
          instructorName: s.instructorName,
          roomCode: s.roomCode,
          courseClassName: s.courseClassName
        }
      }));
      setEvents(scheduleEvents);

      // Set other data for select inputs
      setCourseClasses(toArray(classesRes));
      setRooms(toArray(roomsRes));
      setTimeSlots(toArray(slotsRes));
      setLecturers(toArray(lecturersRes));
    } catch (error) {
      console.error("Failed to fetch calendar data", error);
      toast.error("Không thể tải dữ liệu thời khóa biểu");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setFormData(prev => ({ ...prev, date: selectInfo.startStr }));
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    // For now, we just show simple info or we could enable editing
    const event = clickInfo.event;
    toast.info(`Lớp: ${event.extendedProps.courseClassName}\nPhòng: ${event.extendedProps.roomCode}\nGV: ${event.extendedProps.instructorName || 'Chưa phân công'}`);
  };

  const handleAddSchedule = async () => {
    if (!formData.courseClassId || !formData.roomId || !formData.timeSlotId || !formData.date) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      const selectedClass = courseClasses.find(c => (c.id || c.courseClassId) === formData.courseClassId);
      const dateObj = new Date(formData.date);
      const jsDay = dateObj.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;

      const payload = {
        ...formData,
        dayOfWeek: dayOfWeek,
        semesterId: selectedClass?.semesterId || formData.semesterId
      };

      await scheduleApi.create(payload);
      toast.success("Sắp lịch học thành công!");
      closeModal();
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi sắp lịch học. Có thể bị trùng lịch!");
    }
  };

  const resetModalFields = () => {
    setFormData({
      courseClassId: "",
      roomId: "",
      timeSlotId: "",
      instructorId: "",
      date: "",
      numberOfPeriods: 2,
      semesterId: "77730894-3cf6-4f71-9c60-84ce2289c099",
      note: "",
      mode: "LT",
      scheduleStatus: "PLANNED"
    });
    setSelectedEvent(null);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Thêm lịch học +",
              click: openModal,
            },
          }}
          locale="vi"
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Sắp lịch học mới
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chọn chi tiết lớp học, phòng và ca học để tạo lịch mới.
            </p>
          </div>
          
          <div className="mt-8 space-y-5">
            {/* Lớp học phần & Giảng viên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Lớp học phần <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.courseClassId}
                  onChange={(e) => setFormData({...formData, courseClassId: e.target.value})}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">-- Chọn lớp học phần --</option>
                  {courseClasses.map((c: any) => (
                    <option key={c.id || c.courseClassId} value={c.id || c.courseClassId}>
                      {c.classCode} - {c.courseName || 'Lớp học phần'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Giảng viên
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) => setFormData({...formData, instructorId: e.target.value})}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">-- Chọn giảng viên (tùy chọn) --</option>
                  {lecturers.map((l: any) => (
                    <option key={l.employeeId} value={l.employeeId}>
                      {l.fullName || l.employeeCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phòng học */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Phòng học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r: any) => (
                    <option key={r.roomId || r.id} value={r.roomId || r.id}>
                      {r.code || r.roomCode} ({r.type || r.roomType || 'Phòng học'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ca học */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Ca học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.timeSlotId}
                  onChange={(e) => setFormData({...formData, timeSlotId: e.target.value})}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">-- Chọn ca học --</option>
                  {timeSlots.map((t: any) => (
                    <option key={t.timeSlotId} value={t.timeSlotId}>
                      {t.slotCode}: {t.startTime}-{t.endTime}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ngày áp dụng */}
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Ngày áp dụng <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.date}
                  onChange={(value) => setFormData({...formData, date: value})}
                  placeholder="Chọn ngày áp dụng"
                />
              </div>

              {/* Số tiết */}
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Số tiết
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfPeriods}
                  onChange={(e) => setFormData({...formData, numberOfPeriods: parseInt(e.target.value)})}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* Hình thức */}
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Hình thức
                </label>
                <div className="flex items-center gap-4 h-11">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="LT"
                      checked={formData.mode === "LT"}
                      onChange={() => setFormData({...formData, mode: "LT"})}
                      className="accent-brand-500"
                    />
                    <span className="text-sm">LT</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="TH"
                      checked={formData.mode === "TH"}
                      onChange={() => setFormData({...formData, mode: "TH"})}
                      className="accent-brand-500"
                    />
                    <span className="text-sm">TH</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trạng thái */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Trạng thái
                </label>
                <select
                  value={formData.scheduleStatus}
                  onChange={(e) => setFormData({...formData, scheduleStatus: e.target.value})}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="PLANNED">Đã lên lịch</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Ghi chú
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                rows={3}
                placeholder="Nhập ghi chú (nếu có)..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Ghi chú
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="Nhập ghi chú (nếu có)..."
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAddSchedule}
              type="button"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Sắp lịch
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex flex-col items-start ${colorClass} p-2 rounded-lg w-full overflow-hidden shadow-sm border-l-4`}>
      <div className="text-[10px] font-bold uppercase opacity-70 mb-1">{eventInfo.event.extendedProps.roomCode}</div>
      <div className="fc-event-title text-xs font-semibold leading-tight line-clamp-2">{eventInfo.event.extendedProps.courseClassName}</div>
    </div>
  );
};

export default Calendar;
