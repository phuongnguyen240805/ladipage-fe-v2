"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/features/education/components/ui/button";
import { Input } from "@/features/education/components/ui/input";
import { Label } from "@/features/education/components/ui/label";
import { Textarea } from "@/features/education/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/education/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/education/components/ui/select";
import { BookOpen, GraduationCap, Layers, Search, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/features/education/utils/request";
import { unwrapApiResponse } from "@/features/education/api/response";
import { studentApi } from "@/features/education/api/student";
import { administrativeClassApi } from "@/features/education/api/administrative-class";
import { semesterApi } from "@/features/education/api/semester";
import { lecturerApi } from "@/features/education/api/lecturer";
import { courseClassApi } from "@/features/education/api/course";
import type { StudentListItem } from "@/features/education/types/student";
import type { AdministrativeClass } from "@/features/education/types/lookup";
import type { Semester } from "@/features/education/api/admin-resources";

type StudentClassAssignment = {
  studentClassId?: string;
  studentId?: string;
  classId?: string;
  semesterId?: string;
  note?: string;
  isActive?: boolean;
};

type CourseClass = {
  courseClassId?: string;
  id?: string;
  classCode?: string;
  code?: string;
  courseCode?: string;
  courseName?: string;
  semesterId?: string;
};

type Lecturer = {
  id?: string;
  employeeId?: string;
  instructorId?: string;
  instructorCode?: string;
  fullName?: string;
};

type CourseClassStudent = {
  studentId?: string;
  studentCode?: string;
  fullName?: string;
};

function getClassId(item: AdministrativeClass) {
  return item.classId || item.id || "";
}

function getCourseClassId(item: CourseClass) {
  return item.courseClassId || item.id || "";
}

function getLecturerId(item: Lecturer) {
  return item.instructorId || item.id || item.employeeId || "";
}

function normalizeRows<T>(response: unknown): T[] {
  const data = unwrapApiResponse<any>(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function StudentClassAssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentClassAssignment[]>([]);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [classesList, setClassesList] = useState<AdministrativeClass[]>([]);
  const [semestersList, setSemestersList] = useState<Semester[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [courseClassStudentIds, setCourseClassStudentIds] = useState<Set<string>>(new Set());
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({ studentId: "", note: "" });
  const [courseForm, setCourseForm] = useState({ courseClassId: "", instructorId: "", note: "" });

  const selectedSemester = semestersList.find((semester) => semester.semesterId === selectedSemesterId);
  const selectedClass = classesList.find((item) => getClassId(item) === selectedClassId);

  const studentById = useMemo(() => {
    const map = new Map<string, StudentListItem>();
    students.forEach((student) => {
      if (student.id) map.set(student.id, student);
      if (student.studentId) map.set(student.studentId, student);
    });
    return map;
  }, [students]);

  const assignmentsInSemester = useMemo(
    () => assignments.filter((item) => item.semesterId === selectedSemesterId && item.isActive !== false),
    [assignments, selectedSemesterId],
  );

  const classSummaries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return classesList
      .map((item) => {
        const classId = getClassId(item);
        const members = assignmentsInSemester.filter((assignment) => assignment.classId === classId);
        return { ...item, classId, studentCount: members.length };
      })
      .filter((item) => {
        if (!keyword) return true;
        return [item.classCode, item.className, item.departmentName, item.majorName].some((value) =>
          String(value || "").toLowerCase().includes(keyword),
        );
      })
      .sort((a, b) => String(a.classCode || "").localeCompare(String(b.classCode || "")));
  }, [assignmentsInSemester, classesList, searchTerm]);

  const selectedMembers = useMemo(() => {
    return assignmentsInSemester
      .filter((item) => item.classId === selectedClassId)
      .map((assignment) => ({
        ...assignment,
        student: assignment.studentId ? studentById.get(assignment.studentId) : undefined,
      }))
      .sort((a, b) => String(a.student?.studentCode || "").localeCompare(String(b.student?.studentCode || "")));
  }, [assignmentsInSemester, selectedClassId, studentById]);

  const availableStudents = useMemo(() => {
    const assignedIds = new Set(assignmentsInSemester.map((item) => item.studentId).filter(Boolean));
    const hasCourseClassRoster = courseClassStudentIds.size > 0;

    return students.filter((student) => {
      const id = student.id || student.studentId;
      return id && !assignedIds.has(id) && (!hasCourseClassRoster || courseClassStudentIds.has(id));
    });
  }, [assignmentsInSemester, courseClassStudentIds, students]);

  const totalAssigned = assignmentsInSemester.length;
  const filledClasses = classSummaries.filter((item) => item.studentCount > 0).length;

  const fetchLookups = async () => {
    setLoading(true);
    try {
      const [studentRows, classRows, semesterRows, courseClassRows, lecturerRows] = await Promise.all([
        studentApi.getAll(),
        administrativeClassApi.getAll({ isActive: true }),
        semesterApi.getAll(),
        courseClassApi.getAll(),
        lecturerApi.getAll(),
      ]);
      setStudents(studentRows || []);
      setClassesList(classRows || []);
      setSemestersList(semesterRows || []);
      setCourseClasses(courseClassRows || []);
      setLecturers(lecturerRows || []);

      const activeSemester = (semesterRows || []).find((item) => item.isActive) || semesterRows?.[0];
      if (!selectedSemesterId && activeSemester?.semesterId) {
        setSelectedSemesterId(activeSemester.semesterId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu lớp, sinh viên, học kỳ");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await request.get("/api/v1/student-classes/admin", {
        params: { semesterId: selectedSemesterId || undefined, isActive: true },
      });
      setAssignments(normalizeRows<StudentClassAssignment>(response));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu phân lớp theo học kỳ");
      setAssignments([]);
    }
  };

  const fetchCourseClassStudents = async () => {
    const classesInSemester = courseClasses.filter((item) => !selectedSemesterId || item.semesterId === selectedSemesterId);
    if (!selectedSemesterId || classesInSemester.length === 0) {
      setCourseClassStudentIds(new Set());
      return;
    }

    try {
      const rosters = await Promise.all(
        classesInSemester
          .map(getCourseClassId)
          .filter(Boolean)
          .map((id) => courseClassApi.getStudents(id).catch(() => [])),
      );
      const ids = new Set<string>();
      rosters.flat().forEach((student: CourseClassStudent) => {
        if (student.studentId) ids.add(student.studentId);
      });
      setCourseClassStudentIds(ids);
    } catch {
      setCourseClassStudentIds(new Set());
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    if (selectedSemesterId) fetchAssignments();
  }, [selectedSemesterId]);

  useEffect(() => {
    fetchCourseClassStudents();
  }, [courseClasses, selectedSemesterId]);

  useEffect(() => {
    if (!selectedClassId && classSummaries.length > 0) {
      setSelectedClassId(classSummaries[0].classId);
    }
  }, [classSummaries, selectedClassId]);

  const openStudentModal = () => {
    if (!selectedSemesterId || !selectedClassId) {
      toast.error("Vui lòng chọn học kỳ và lớp hành chính");
      return;
    }
    setStudentForm({ studentId: "", note: "" });
    setStudentModalOpen(true);
  };

  const handleAssignStudent = async () => {
    if (!studentForm.studentId || !selectedClassId || !selectedSemesterId) {
      toast.error("Vui lòng chọn sinh viên, lớp và học kỳ");
      return;
    }

    setSaving(true);
    try {
      await request.post("/api/v1/student-classes/admin", {
        studentId: studentForm.studentId,
        classId: selectedClassId,
        semesterId: selectedSemesterId,
        status: "ACTIVE",
        isActive: true,
        note: studentForm.note,
      });
      toast.success("Đã gán sinh viên vào lớp hành chính");
      setStudentModalOpen(false);
      fetchAssignments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gán sinh viên thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = async (assignmentId?: string) => {
    if (!assignmentId) return;
    if (!confirm("Xóa sinh viên khỏi lớp hành chính trong học kỳ này?")) return;

    try {
      await request.delete(`/api/v1/student-classes/admin/${assignmentId}`);
      toast.success("Đã xóa sinh viên khỏi lớp");
      fetchAssignments();
    } catch {
      toast.error("Xóa sinh viên khỏi lớp thất bại");
    }
  };

  const openCourseModal = () => {
    if (!selectedSemesterId || !selectedClassId) {
      toast.error("Vui lòng chọn học kỳ và lớp hành chính");
      return;
    }
    setCourseForm({ courseClassId: "", instructorId: "", note: "" });
    setCourseModalOpen(true);
  };

  const handleAssignCourseClass = async () => {
    if (!courseForm.courseClassId || !courseForm.instructorId || !selectedClassId || !selectedSemesterId) {
      toast.error("Vui lòng chọn lớp học phần và giảng viên");
      return;
    }

    setSaving(true);
    try {
      await request.post("/api/v1/teaching-assignments/admin", {
        instructorId: courseForm.instructorId,
        courseClassId: courseForm.courseClassId,
        classId: selectedClassId,
        semesterId: selectedSemesterId,
        isActive: true,
        note: courseForm.note,
      });
      toast.success("Đã gán lớp học phần và giảng viên");
      setCourseModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gán lớp học phần thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phân lớp theo học kỳ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sinh viên ban đầu nằm trong lớp học phần theo môn và học kỳ. Sau khi chọn hướng học, dùng màn này để chuyển/gán sang lớp hành chính.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-[240px]">
            <Label>Học kỳ</Label>
            <Select
              value={selectedSemesterId}
              onValueChange={(value) => {
                setSelectedSemesterId(value);
                setSelectedClassId("");
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {semestersList.filter((semester) => semester.semesterId).map((semester) => (
                  <SelectItem key={semester.semesterId} value={semester.semesterId || ""}>
                    {semester.name || semester.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openStudentModal} className="mt-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Gán sinh viên
          </Button>
          <Button onClick={openCourseModal} variant="outline" className="mt-auto">
            <BookOpen className="mr-2 h-4 w-4" />
            Gán lớp học phần
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Học kỳ đang xem</p>
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold">{selectedSemester?.name || "Chưa chọn"}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Lớp có sinh viên</p>
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold">
            {filledClasses}/{classesList.length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Sinh viên từ lớp học phần</p>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold">{courseClassStudentIds.size}</p>
          <p className="mt-1 text-xs text-muted-foreground">{totalAssigned} đã gán lớp hành chính</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm lớp hành chính, khoa, ngành..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">Lớp hành chính</th>
                  <th className="px-4 py-3 text-left font-semibold">Khoa / đơn vị</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngành</th>
                  <th className="px-4 py-3 text-center font-semibold">Sĩ số</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {classSummaries.map((item) => (
                  <tr
                    key={item.classId}
                    onClick={() => setSelectedClassId(item.classId)}
                    className={`cursor-pointer border-b transition hover:bg-muted/50 ${
                      selectedClassId === item.classId ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold">{item.classCode || "—"}</p>
                      <p className="text-xs text-muted-foreground">{item.className || "Chưa có tên lớp"}</p>
                    </td>
                    <td className="px-4 py-3">{item.departmentName || "—"}</td>
                    <td className="px-4 py-3">{item.majorName || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.studentCount}/{item.maxSize || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.isActive === false ? (
                        <span className="text-xs text-muted-foreground">Ngừng hoạt động</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700">Đang mở</span>
                      )}
                    </td>
                  </tr>
                ))}
                {classSummaries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Không tìm thấy lớp hành chính phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <p className="text-sm text-muted-foreground">Danh sách sinh viên trong lớp</p>
            <h2 className="mt-1 text-xl font-bold">{selectedClass?.classCode || "Chọn lớp"}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedClass?.className || "Chọn một lớp ở bảng bên trái để quản lý."}
            </p>
          </div>
          <div className="max-h-[620px] overflow-y-auto p-4">
            {selectedMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Lớp này chưa có sinh viên trong học kỳ đã chọn.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedMembers.map((item) => (
                  <div key={item.studentClassId} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.student?.fullName || "Chưa lấy được tên"}</p>
                      <p className="text-xs text-muted-foreground">{item.student?.studentCode || item.studentId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleRemoveStudent(item.studentClassId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gán sinh viên vào lớp hành chính</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground">Học kỳ</p>
                <p className="font-semibold">{selectedSemester?.name || "—"}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-muted-foreground">Lớp</p>
                <p className="font-semibold">{selectedClass?.classCode || "—"}</p>
              </div>
            </div>
            <div>
              <Label>Sinh viên từ lớp học phần chưa gán lớp hành chính</Label>
              <Select value={studentForm.studentId} onValueChange={(value) => setStudentForm({ ...studentForm, studentId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn sinh viên" />
                </SelectTrigger>
                <SelectContent className="max-h-[320px]">
                  {availableStudents.filter((student) => student.id || student.studentId).map((student) => (
                    <SelectItem key={student.id || student.studentId} value={student.id || student.studentId || ""}>
                      {student.studentCode} - {student.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea value={studentForm.note} onChange={(event) => setStudentForm({ ...studentForm, note: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignStudent} disabled={saving}>
              Lưu phân lớp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gán lớp học phần và giảng viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Lớp học phần sau khi chia</Label>
              <Select value={courseForm.courseClassId} onValueChange={(value) => setCourseForm({ ...courseForm, courseClassId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn lớp học phần" />
                </SelectTrigger>
                <SelectContent className="max-h-[320px]">
                  {courseClasses
                    .filter((item) => !selectedSemesterId || !item.semesterId || item.semesterId === selectedSemesterId)
                    .filter((item) => getCourseClassId(item))
                    .map((item) => (
                      <SelectItem key={getCourseClassId(item)} value={getCourseClassId(item)}>
                        {item.classCode || item.code || "Lớp học phần"} - {item.courseCode || item.courseName || ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giảng viên phụ trách</Label>
              <Select value={courseForm.instructorId} onValueChange={(value) => setCourseForm({ ...courseForm, instructorId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>
                <SelectContent className="max-h-[320px]">
                  {lecturers.filter((lecturer) => getLecturerId(lecturer)).map((lecturer) => (
                    <SelectItem key={getLecturerId(lecturer)} value={getLecturerId(lecturer)}>
                      {lecturer.instructorCode || "GV"} - {lecturer.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ghi chú</Label>
              <Textarea value={courseForm.note} onChange={(event) => setCourseForm({ ...courseForm, note: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignCourseClass} disabled={saving}>
              Lưu phân công
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
