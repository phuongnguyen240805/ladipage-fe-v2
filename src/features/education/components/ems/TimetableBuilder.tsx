"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import { Draggable, EventReceiveArg } from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { useModal } from "@/features/education/hooks/useModal";
import { scheduleApi } from "@/features/education/api/schedule";
import { courseClassApi } from "@/features/education/api/course";
import { roomApi } from "@/features/education/api/room";
import { timeSlotApi } from "@/features/education/api/timeSlot";
import { lecturerApi } from "@/features/education/api/lecturer";
import { semesterApi } from "@/features/education/api/semester";
import { toast } from "sonner";
import { Filter, Bot, Loader2, CalendarRange, MapPin } from "lucide-react";

// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/education/components/ui/select";

import TimetableSidebar from "./timetable/TimetableSidebar";
import TimetableCalendar from "./timetable/TimetableCalendar";
import TimetableModal from "./timetable/TimetableModal";

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const courseClassIdOf = (courseClass: any) => String(courseClass?.courseClassId || courseClass?.id || "");
const roomIdOf = (room: any) => String(room?.roomId || room?.id || "");
const timeSlotIdOf = (timeSlot: any) => String(timeSlot?.timeSlotId || timeSlot?.id || "");
const lecturerIdOf = (lecturer: any) => String(lecturer?.employeeId || lecturer?.id || "");

const unwrapResponseData = (response: any) => response?.data?.data || response?.data || response || {};

const timeToMinutes = (time?: string) => {
  if (!time) return Number.MAX_SAFE_INTEGER;
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
};

const sortTimeSlots = (slots: any[]) => {
  return [...slots].sort((a, b) => {
    const byStartTime = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (byStartTime !== 0) return byStartTime;
    return String(a.slotCode || "").localeCompare(String(b.slotCode || ""), "vi", { numeric: true });
  });
};

export default function TimetableBuilder() {
  const [events, setEvents] = useState<any[]>([]);
  const [courseClasses, setCourseClasses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  
  // State phục vụ tìm kiếm & lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("ALL"); // ALL | LECTURER | COURSE_CLASS | ROOM
  const [filterId, setFilterId] = useState("ALL");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [autoScheduleStatus, setAutoScheduleStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseClassId: "",
    courseClassName: "",
    roomId: "",
    roomCode: "",
    timeSlotId: "",
    slotCode: "",
    instructorId: "",
    instructorName: "",
    date: "",
    numberOfPeriods: 2,
    semesterId: "",
    note: "",
    mode: "LT",
    scheduleStatus: "PLANNED"
  });

  const calendarRef = useRef<FullCalendar>(null);
  const externalEventsRef = useRef<HTMLDivElement>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const buildCalendarEvent = (schedule: any, slots: any[] = timeSlots) => {
    const slot = slots.find((ts: any) => timeSlotIdOf(ts) === String(schedule.timeSlotId));

    let eventDate = schedule.date;
    if (!eventDate) {
      const today = new Date();
      const currentDay = today.getDay() === 0 ? 7 : today.getDay();
      const targetDay = schedule.dayOfWeek || 1;
      const diff = targetDay - currentDay;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      eventDate = targetDate.toISOString().split('T')[0];
    }

    let start = eventDate;
    let end = eventDate;
    let allDay = true;

    if (slot) {
      start = `${eventDate}T${slot.startTime}`;
      end = `${eventDate}T${slot.endTime}`;
      allDay = false;
    }

    return {
      id: schedule.scheduleId,
      title: `${schedule.courseClassName || schedule.classCode || 'Lớp học'} - ${schedule.roomCode || 'Chưa xếp phòng'}`,
      start,
      end,
      allDay,
      extendedProps: {
        calendar: schedule.mode === 'TH' ? 'Warning' : 'Primary',
        instructorName: schedule.instructorName,
        instructorId: schedule.instructorId,
        roomCode: schedule.roomCode,
        roomId: schedule.roomId,
        courseClassName: schedule.courseClassName,
        courseClassId: schedule.courseClassId,
        timeSlotId: schedule.timeSlotId,
        slotCode: schedule.slotCode,
        numberOfPeriods: schedule.numberOfPeriods,
        semesterId: schedule.semesterId,
        mode: schedule.mode,
        scheduleStatus: schedule.scheduleStatus,
        note: schedule.note
      }
    };
  };

  const buildCalendarEventFromPayload = (scheduleId: string, payload: any) => {
    const selectedClass = courseClasses.find((c: any) => courseClassIdOf(c) === String(payload.courseClassId));
    const selectedRoom = rooms.find((r: any) => roomIdOf(r) === String(payload.roomId));
    const selectedSlot = timeSlots.find((ts: any) => timeSlotIdOf(ts) === String(payload.timeSlotId));
    const selectedLecturer = lecturers.find((l: any) => lecturerIdOf(l) === String(payload.instructorId));

    return buildCalendarEvent({
      ...payload,
      scheduleId,
      courseClassName: selectedClass?.classCode || selectedClass?.courseClassName || payload.courseClassName,
      classCode: selectedClass?.classCode,
      roomCode: selectedRoom?.code || selectedRoom?.roomCode || payload.roomCode,
      slotCode: selectedSlot?.slotCode || payload.slotCode,
      instructorName: selectedLecturer?.fullName || selectedLecturer?.name || payload.instructorName
    });
  };

  // Tải danh sách học kỳ khi component mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const semestersList = await semesterApi.getAll();
        setSemesters(semestersList || []);
        if (semestersList && semestersList.length > 0) {
          const activeSem = semestersList.find((s: any) => s.status || s.isActive);
          const defaultSemId = (activeSem ? activeSem.semesterId : semestersList[0].semesterId) || "";
          setSelectedSemesterId(defaultSemId);
          setFormData(prev => ({ ...prev, semesterId: defaultSemId }));
        }
      } catch (error) {
        console.error("Failed to fetch semesters", error);
        toast.error("Không thể tải danh sách học kỳ");
      }
    };
    fetchSemesters();
  }, []);

  const fetchInitialData = async () => {
    if (!selectedSemesterId) return;
    try {
      const [schedulesRes, classesRes, roomsRes, slotsRes, lecturersRes] = await Promise.all([
        scheduleApi.getAll(),
        courseClassApi.getBySemester(selectedSemesterId),
        roomApi.getAll(),
        timeSlotApi.getAll(),
        lecturerApi.getAll()
      ]);

      const listSlots = sortTimeSlots(toArray(slotsRes));
      const schedulesList = toArray(schedulesRes);
      let classesList = toArray(classesRes);

      if (classesList.length === 0) {
        classesList = toArray(await courseClassApi.getAll());
      }
      
      // Lọc các lịch thuộc học kỳ hiện tại
      const semesterSchedules = schedulesList.filter((s: any) => s.semesterId === selectedSemesterId);

      const scheduleEvents = semesterSchedules.map((s: any) => buildCalendarEvent(s, listSlots));

      setEvents(scheduleEvents);
      setCourseClasses(classesList);
      setRooms(toArray(roomsRes));
      setTimeSlots(listSlots);
      setLecturers(toArray(lecturersRes));
    } catch (error) {
      console.error("Failed to fetch calendar data", error);
      toast.error("Không thể tải dữ liệu thời khóa biểu");
    }
  };

  useEffect(() => {
    if (selectedSemesterId) {
      fetchInitialData();
    }
  }, [selectedSemesterId]);

  // Khởi tạo tính năng kéo thả
  useEffect(() => {
    if (externalEventsRef.current) {
      let draggable = new Draggable(externalEventsRef.current, {
        itemSelector: ".fc-event",
        eventData: function(eventEl) {
          let title = eventEl.getAttribute("data-title");
          let id = eventEl.getAttribute("data-id");
          return {
            title: title,
            id: id,
            duration: "01:00",
            extendedProps: {
              courseClassId: id
            }
          };
        }
      });

      return () => {
        draggable.destroy();
      };
    }
  }, [courseClasses]);

  // LOGIC LỌC SỰ KIỆN THEO CHẾ ĐỘ XEM
  const filteredEvents = useMemo(() => {
    if (viewMode === "ALL" || filterId === "ALL") return events;
    
    return events.filter(event => {
      if (viewMode === "LECTURER") {
        return event.extendedProps.instructorId === filterId;
      }
      if (viewMode === "COURSE_CLASS") {
        return event.extendedProps.courseClassId === filterId;
      }
      if (viewMode === "ROOM") {
        return event.extendedProps.roomId === filterId;
      }
      return true;
    });
  }, [events, viewMode, filterId]);

  const resetModalFields = () => {
    setFormData({
      courseClassId: "",
      courseClassName: "",
      roomId: "",
      roomCode: "",
      timeSlotId: "",
      slotCode: "",
      instructorId: "",
      instructorName: "",
      date: "",
      numberOfPeriods: 2,
      semesterId: selectedSemesterId,
      note: "",
      mode: "LT",
      scheduleStatus: "PLANNED"
    });
    setIsEditing(false);
    setEditingScheduleId(null);
  };

  const handleCloseModal = () => {
    closeModal();
    resetModalFields();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    const timePart = selectInfo.startStr.includes('T') ? selectInfo.startStr.split('T')[1].substring(0, 5) : "";
    const matchedSlot = findMatchingTimeSlot(timePart, timeSlots);
    setFormData(prev => ({
      ...prev,
      date: selectInfo.startStr.split('T')[0],
      timeSlotId: matchedSlot?.timeSlotId || ""
    }));
    openModal();
  };

  const handleEventReceive = (info: EventReceiveArg) => {
    const dateStr = info.event.startStr.split('T')[0];
    const courseClassId = info.event.extendedProps.courseClassId || info.event.id;
    const timePart = info.event.startStr.includes('T') ? info.event.startStr.split('T')[1].substring(0, 5) : "";
    const matchedSlot = findMatchingTimeSlot(timePart, timeSlots);
    
    info.revert();
    
    resetModalFields();
    setFormData(prev => ({ 
      ...prev, 
      date: dateStr,
      courseClassId: courseClassId,
      timeSlotId: matchedSlot?.timeSlotId || ""
    }));
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const props = event.extendedProps;
    setFormData({
      courseClassId: props.courseClassId || "",
      courseClassName: props.courseClassName || "",
      roomId: props.roomId || "",
      roomCode: props.roomCode || "",
      timeSlotId: props.timeSlotId || "",
      slotCode: props.slotCode || "",
      instructorId: props.instructorId || "",
      instructorName: props.instructorName || "",
      date: event.startStr.split('T')[0],
      numberOfPeriods: props.numberOfPeriods || 2,
      semesterId: props.semesterId || selectedSemesterId,
      note: props.note || "",
      mode: props.mode || "LT",
      scheduleStatus: props.scheduleStatus || "PLANNED"
    });
    setEditingScheduleId(event.id);
    setIsEditing(true);
    openModal();
  };

  const handleAddSchedule = async () => {
    if (!formData.courseClassId || !formData.instructorId || !formData.roomId || !formData.timeSlotId || !formData.date) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    if (isSaving) return;

    try {
      setIsSaving(true);
      const selectedClass = courseClasses.find(c => courseClassIdOf(c) === String(formData.courseClassId));
      const dateObj = new Date(formData.date);
      const jsDay = dateObj.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;

      const payload = {
        ...formData,
        dayOfWeek: dayOfWeek,
        semesterId: selectedClass?.semesterId || formData.semesterId
      };

      let savedScheduleId = editingScheduleId || "";

      if (isEditing && editingScheduleId) {
        const response = await scheduleApi.update(editingScheduleId, payload);
        const saved = unwrapResponseData(response);
        savedScheduleId = saved.scheduleId || editingScheduleId;
        toast.success("Cập nhật lịch học thành công!");
      } else {
        const response = await scheduleApi.create(payload);
        const saved = unwrapResponseData(response);
        savedScheduleId = saved.scheduleId || "";
        toast.success("Sắp lịch học thành công!");
      }

      if (savedScheduleId) {
        const nextEvent = buildCalendarEventFromPayload(savedScheduleId, payload);
        setEvents(prev => {
          if (isEditing) {
            return prev.map(event => event.id === savedScheduleId ? nextEvent : event);
          }
          return [...prev.filter(event => event.id !== savedScheduleId), nextEvent];
        });
      }

      handleCloseModal();
      void fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu lịch học. Có thể bị trùng lịch!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!editingScheduleId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa lịch học này?")) return;
    try {
      await scheduleApi.delete(editingScheduleId);
      setEvents(prev => prev.filter(event => event.id !== editingScheduleId));
      toast.success("Xóa lịch học thành công!");
      handleCloseModal();
      void fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa lịch học.");
    }
  };

  const findMatchingTimeSlot = (timeStr: string, slots: any[]) => {
    if (!timeStr) return null;
    const parseTimeToMinutes = (t: string) => {
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + (parts[1] || 0);
    };
    const targetMin = parseTimeToMinutes(timeStr);
    
    let bestSlot = null;
    let minDiff = Infinity;
    
    for (const slot of slots) {
      const startMin = parseTimeToMinutes(slot.startTime);
      const endMin = parseTimeToMinutes(slot.endTime);
      if (targetMin >= startMin && targetMin < endMin) {
        return slot;
      }
      const diff = Math.abs(startMin - targetMin);
      if (diff < minDiff) {
        minDiff = diff;
        bestSlot = slot;
      }
    }
    return bestSlot;
  };

  const handleEventDropOrResize = async (info: any) => {
    const event = info.event;
    const scheduleId = event.id;
    
    const originalEvent = events.find(e => e.id === scheduleId);
    if (!originalEvent) {
      info.revert();
      return;
    }
    
    const newDate = event.startStr.split('T')[0];
    let newTimeSlotId = originalEvent.extendedProps.timeSlotId;
    
    if (event.startStr.includes('T')) {
      const timePart = event.startStr.split('T')[1].substring(0, 5); // "HH:MM"
      const matchedSlot = findMatchingTimeSlot(timePart, timeSlots);
      if (matchedSlot) {
        newTimeSlotId = matchedSlot.timeSlotId;
      }
    }
    
    const dateObj = new Date(newDate);
    const jsDay = dateObj.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    
    // Tính toán số tiết mới nếu bị thay đổi kích thước
    let newPeriods = originalEvent.extendedProps.numberOfPeriods;
    if (event.end && event.start) {
      const diffMs = event.end.getTime() - event.start.getTime();
      const diffMins = diffMs / (1000 * 60);
      newPeriods = Math.max(1, Math.round(diffMins / 50)); // ~50 phút một tiết
    }

    const payload = {
      scheduleId,
      courseClassId: originalEvent.extendedProps.courseClassId,
      roomId: originalEvent.extendedProps.roomId,
      timeSlotId: newTimeSlotId,
      instructorId: originalEvent.extendedProps.instructorId,
      date: newDate,
      dayOfWeek,
      numberOfPeriods: newPeriods,
      semesterId: originalEvent.extendedProps.semesterId || selectedSemesterId,
      mode: originalEvent.extendedProps.mode || "LT",
      scheduleStatus: originalEvent.extendedProps.scheduleStatus || "PLANNED",
      note: originalEvent.extendedProps.note || ""
    };
    
    try {
      await scheduleApi.update(scheduleId, payload);
      toast.success("Đã di chuyển lịch học thành công!");
      fetchInitialData();
    } catch (error: any) {
      info.revert();
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật lịch học. Có thể bị trùng lịch!");
    }
  };

  const handleViewModeChange = (val: string) => {
    setViewMode(val);
    setFilterId("ALL");
  };

  const handleAutoSchedule = async () => {
    if (!selectedSemesterId) {
      toast.error("Vui lòng chọn học kỳ");
      return;
    }
    try {
      setIsAutoScheduling(true);
      setAutoScheduleStatus("Đang khởi tạo thuật toán...");
      await scheduleApi.generateAutoSchedule(selectedSemesterId);

      const interval = setInterval(async () => {
        try {
          const res = await scheduleApi.getAutoScheduleStatus(selectedSemesterId);
          const statusName = res.data?.data;
          setAutoScheduleStatus("Trạng thái: " + statusName);
          
          if (statusName === "NOT_SOLVING") {
            clearInterval(interval);
            setIsAutoScheduling(false);
            toast.success("Đã hoàn tất tự động xếp lịch!");
            fetchInitialData();
          }
        } catch (e) {
          clearInterval(interval);
          setIsAutoScheduling(false);
        }
      }, 3000);

    } catch (error: any) {
      setIsAutoScheduling(false);
      toast.error("Không thể chạy tự động xếp lịch");
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[680px] w-full max-w-full flex-col gap-4 overflow-hidden text-[14px]">
      {/* TOOLBAR */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-3 p-3.5 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm transition-all">
        {/* Semester Selector */}
        <div className="flex min-w-0 flex-wrap items-center gap-2 px-2 text-[14px] font-semibold text-indigo-600 dark:text-indigo-400 md:border-r border-gray-200 dark:border-gray-800 pr-4">
          <CalendarRange className="w-4 h-4" />
          <span>Học kỳ:</span>
          <Select value={selectedSemesterId} onValueChange={(val) => { setSelectedSemesterId(val); setFormData(prev => ({ ...prev, semesterId: val })); }}>
            <SelectTrigger className="ml-0 h-9 w-[min(180px,calc(100vw-3rem))] bg-white dark:bg-gray-900 rounded-lg border-gray-200 dark:border-gray-700 md:ml-2">
              <SelectValue placeholder="Chọn học kỳ" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {semesters.map(sem => (
                <SelectItem key={sem.semesterId} value={sem.semesterId}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-[14px] font-semibold text-brand-600 dark:text-brand-400">
          <Filter className="w-4 h-4" />
          <span>Lọc theo:</span>
        </div>
        
        <Select value={viewMode} onValueChange={handleViewModeChange}>
          <SelectTrigger className="h-10 w-[min(200px,calc(100vw-3rem))] bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Chọn chế độ xem" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">Toàn trường</SelectItem>
            <SelectItem value="LECTURER">Theo Giảng viên</SelectItem>
            <SelectItem value="COURSE_CLASS">Theo Lớp học phần</SelectItem>
            <SelectItem value="ROOM">Theo Phòng học</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === "LECTURER" && (
          <Select value={filterId} onValueChange={setFilterId}>
            <SelectTrigger className="h-10 w-[min(300px,calc(100vw-3rem))] bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="-- Chọn giảng viên --" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Tất cả giảng viên</SelectItem>
              {lecturers.map(l => (
                <SelectItem key={lecturerIdOf(l)} value={lecturerIdOf(l)}>
                  {l.fullName} ({l.instructorCode || l.employeeCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {viewMode === "COURSE_CLASS" && (
          <Select value={filterId} onValueChange={setFilterId}>
            <SelectTrigger className="h-10 w-[min(300px,calc(100vw-3rem))] bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="-- Chọn lớp học phần --" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Tất cả lớp học phần</SelectItem>
              {courseClasses.map(c => (
                <SelectItem key={courseClassIdOf(c)} value={courseClassIdOf(c)}>
                  {c.classCode} - {c.courseName || 'Lớp học phần'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {viewMode === "ROOM" && (
          <Select value={filterId} onValueChange={setFilterId}>
            <SelectTrigger className="h-10 w-[min(300px,calc(100vw-3rem))] bg-white dark:bg-gray-900 rounded-xl border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="-- Chọn phòng học --" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Tất cả phòng học</SelectItem>
              {rooms.map(r => (
                <SelectItem key={roomIdOf(r)} value={roomIdOf(r)}>
                  {r.code || r.roomCode} ({r.type || r.roomType || 'Phòng'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto min-w-fit">
          <button
            onClick={handleAutoSchedule}
            disabled={isAutoScheduling}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAutoScheduling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{autoScheduleStatus}</span>
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                <span>AI Xếp Lịch Tự Động</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[clamp(220px,20vw,300px)_minmax(0,1fr)]">
        <TimetableSidebar 
          courseClasses={courseClasses}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          externalEventsRef={externalEventsRef}
        />
        <TimetableCalendar 
          events={filteredEvents}
          calendarRef={calendarRef}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          onEventReceive={handleEventReceive}
          onEventDrop={handleEventDropOrResize}
          onEventResize={handleEventDropOrResize}
        />
        <TimetableModal 
          isOpen={isOpen}
          onClose={handleCloseModal}
          formData={formData}
          setFormData={setFormData}
          courseClasses={courseClasses}
          rooms={rooms}
          timeSlots={timeSlots}
          lecturers={lecturers}
          onSubmit={handleAddSchedule}
          isEditing={isEditing}
          isSubmitting={isSaving}
          onDelete={handleDeleteSchedule}
        />
      </div>
    </div>
  );
}
