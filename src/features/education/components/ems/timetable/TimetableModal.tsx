import React from 'react';
import { Modal } from "@/features/education/components/ui/modal";
import { CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { Label } from "@/features/education/components/ui/label";
import { Input } from "@/features/education/components/ui/input";
import { Button } from "@/features/education/components/ui/button";
import { Textarea } from "@/features/education/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/features/education/components/ui/select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  courseClasses: any[];
  rooms: any[];
  timeSlots: any[];
  lecturers: any[];
  onSubmit: () => Promise<void>;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onDelete?: () => Promise<void>;
}

const courseClassIdOf = (courseClass: any) => String(courseClass?.courseClassId || courseClass?.id || "");
const roomIdOf = (room: any) => String(room?.roomId || room?.id || "");
const timeSlotIdOf = (timeSlot: any) => String(timeSlot?.timeSlotId || timeSlot?.id || "");
const lecturerIdOf = (lecturer: any) => String(lecturer?.employeeId || lecturer?.id || "");

const courseClassLabel = (courseClass: any) => {
  if (!courseClass) return "";
  return `${courseClass.classCode || courseClass.courseClassName || "Chua ro ma lop"} - ${courseClass.courseName || "Mon hoc"}`;
};

const lecturerLabel = (lecturer: any) => {
  if (!lecturer) return "";
  const code = lecturer.instructorCode || lecturer.employeeCode || "";
  return `${lecturer.fullName || lecturer.name || "Chua ro giang vien"}${code ? ` (${code})` : ""}`;
};

const roomLabel = (room: any) => {
  if (!room) return "";
  return `${room.code || room.roomCode || "Khong ro ma phong"} (${room.type || room.roomType || "Phong hoc"})`;
};

const timeSlotLabel = (timeSlot: any) => {
  if (!timeSlot) return "";
  return `${timeSlot.slotCode || "Ca hoc"}: ${timeSlot.startTime || ""} - ${timeSlot.endTime || ""}`;
};

export default function TimetableModal({ isOpen, onClose, formData, setFormData, courseClasses, rooms, timeSlots, lecturers, onSubmit, isEditing = false, isSubmitting = false, onDelete }: Props) {
  const selectedCourseClass = courseClasses.find((c: any) => courseClassIdOf(c) === String(formData.courseClassId));
  const selectedLecturer = lecturers.find((l: any) => lecturerIdOf(l) === String(formData.instructorId));
  const selectedRoom = rooms.find((r: any) => roomIdOf(r) === String(formData.roomId));
  const selectedTimeSlot = timeSlots.find((t: any) => timeSlotIdOf(t) === String(formData.timeSlotId));
  const selectedCourseClassLabel = courseClassLabel(selectedCourseClass) || formData.courseClassName || "";
  const selectedLecturerLabel = lecturerLabel(selectedLecturer) || formData.instructorName || "";
  const selectedRoomLabel = roomLabel(selectedRoom) || formData.roomCode || "";
  const selectedTimeSlotLabel = timeSlotLabel(selectedTimeSlot) || formData.slotCode || "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[650px] p-6 lg:p-8 rounded-2xl"
    >
      <div className="flex flex-col px-1 overflow-y-auto custom-scrollbar max-h-[85vh]">
        <div className="mb-6">
          <h5 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <CalendarDays className="text-brand-500 h-6 w-6" />
            {isEditing ? "Chi Tiết & Chỉnh Sửa Lịch Học" : "Sắp Lịch Học Mới"}
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            {isEditing ? "Cập nhật hoặc xóa buổi học phần đã xếp." : "Phân công thời gian, phòng học và giảng viên cho lớp học phần."}
          </p>
        </div>
        
        <div className="space-y-5">
          {selectedCourseClass && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedCourseClass.classCode || selectedCourseClass.courseClassName}
                  </div>
                  <div className="mt-0.5 text-slate-600 dark:text-slate-350">
                    {selectedCourseClass.courseName || 'Chưa có tên môn học'}
                  </div>
                </div>
                <div className="rounded-lg bg-white px-3 py-1 font-semibold text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400">
                  {selectedCourseClass.credits || 0} TC
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-4">
                <div>Sĩ số: {selectedCourseClass.currentStudent ?? selectedCourseClass.currentStudents ?? 0}/{selectedCourseClass.maxStudent ?? selectedCourseClass.maxStudents ?? '-'}</div>
                <div>Học kỳ: {selectedCourseClass.semesterName || selectedCourseClass.semesterCode || '-'}</div>
                <div>Bắt đầu: {selectedCourseClass.startDate || '-'}</div>
                <div>Kết thúc: {selectedCourseClass.endDate || '-'}</div>
              </div>
            </div>
          )}

          {/* Lớp học phần & Giảng viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Lớp học phần <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.courseClassId || ""} 
                onValueChange={(val) => {
                  const nextClass = courseClasses.find((c: any) => courseClassIdOf(c) === String(val));
                  setFormData({
                    ...formData,
                    courseClassId: val,
                    roomId: nextClass?.roomId || formData.roomId,
                    semesterId: nextClass?.semesterId || formData.semesterId
                  });
                }}
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="-- Chọn lớp học phần --">{selectedCourseClassLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {courseClasses?.length > 0 ? (
                    courseClasses.map((c: any) => (
                      <SelectItem key={courseClassIdOf(c)} value={courseClassIdOf(c)}>
                        {courseClassLabel(c)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">Không có lớp nào</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Giảng viên phụ trách <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.instructorId || ""} 
                onValueChange={(val) => setFormData({...formData, instructorId: val})}
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="-- Chọn giảng viên --">{selectedLecturerLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {lecturers?.length > 0 ? (
                    lecturers.map((l: any) => (
                      <SelectItem key={lecturerIdOf(l)} value={lecturerIdOf(l)}>
                        {lecturerLabel(l)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">Chưa có dữ liệu</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phòng học & Ca học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Phòng học <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.roomId || ""} 
                onValueChange={(val) => setFormData({...formData, roomId: val})}
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="-- Chọn phòng --">{selectedRoomLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {rooms?.length > 0 ? (
                    rooms.map((r: any) => (
                      <SelectItem key={roomIdOf(r)} value={roomIdOf(r)}>
                        {roomLabel(r)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">Chưa có dữ liệu</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ca học <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.timeSlotId || ""} 
                onValueChange={(val) => setFormData({...formData, timeSlotId: val})}
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 dark:bg-gray-800/50">
                  <SelectValue placeholder="-- Chọn ca học --">{selectedTimeSlotLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {timeSlots?.length > 0 ? (
                    timeSlots.map((t: any) => (
                      <SelectItem key={timeSlotIdOf(t)} value={timeSlotIdOf(t)}>
                        {timeSlotLabel(t)}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">Chưa có dữ liệu</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ngày áp dụng, Số tiết, Hình thức */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-1 space-y-2">
              <Label>Ngày học <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="h-11 bg-gray-50/50 dark:bg-gray-800/50"
              />
            </div>

            <div className="sm:col-span-1 space-y-2">
              <Label>Số tiết</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfPeriods || 1}
                onChange={(e) => setFormData({...formData, numberOfPeriods: parseInt(e.target.value) || 1})}
                className="h-11 bg-gray-50/50 dark:bg-gray-800/50"
              />
            </div>

            <div className="sm:col-span-1 space-y-2">
              <Label>Hình thức</Label>
              <div className="flex items-center gap-6 h-11 bg-gray-50/50 dark:bg-gray-800/50 px-4 rounded-md border border-input">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-foreground">
                  <input
                    type="radio"
                    name="mode"
                    value="LT"
                    checked={formData.mode === "LT"}
                    onChange={() => setFormData({...formData, mode: "LT"})}
                    className="accent-brand-500 w-4 h-4"
                  />
                  Lý thuyết
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-foreground">
                  <input
                    type="radio"
                    name="mode"
                    value="TH"
                    checked={formData.mode === "TH"}
                    onChange={() => setFormData({...formData, mode: "TH"})}
                    className="accent-brand-500 w-4 h-4"
                  />
                  Thực hành
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.note || ""}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              rows={2}
              placeholder="Ví dụ: Cần mượn thêm máy chiếu, phòng máy tính..."
              className="resize-none bg-gray-50/50 dark:bg-gray-800/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-border">
          <div>
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                type="button"
                className="px-6 h-11"
              >
                Xóa Lịch học
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} type="button" className="px-6 h-11">
              Hủy bỏ
            </Button>
            <Button 
              onClick={onSubmit} 
              type="button" 
              disabled={isSubmitting}
              className="px-6 h-11 bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Đang lưu..." : isEditing ? "Cập Nhật Lịch" : "Xác nhận Lịch"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
