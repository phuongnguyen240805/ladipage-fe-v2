'use client';

import { studentPortalApi } from '@/features/education/api/student-portal';
import { Badge } from '@/features/education/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/education/components/ui/card';
import type { StudentAcademicResult, StudentRegistration, StudentScheduleItem } from '@/features/education/types/student-portal';
import { BookOpen, CalendarDays, GraduationCap, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type SemesterGroup = {
  label: string;
  registrations: StudentRegistration[];
  credits: number;
};

const STATUS_LABELS: Record<number, string> = {
  0: 'Chờ duyệt',
  1: 'Đã đăng ký',
  2: 'Đang học',
  3: 'Hoàn thành',
  4: 'Đã hủy',
};

export default function StudentMySchedulePage() {
  const [schedules, setSchedules] = useState<StudentScheduleItem[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [academic, setAcademic] = useState<StudentAcademicResult | null>(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      studentPortalApi.getMySchedule(),
      studentPortalApi.getRegistrations(),
      studentPortalApi.getAcademicResult(),
    ]).then(([schedulePayload, registrationPayload, academicPayload]) => {
      if (!mounted) return;

      setSchedules(schedulePayload.data);
      setRegistrations(registrationPayload.data);
      setAcademic(academicPayload.data);

      const firstSemester =
        registrationPayload.data[0]?.semesterLabel ||
        academicPayload.data.semesters.at(-1)?.label ||
        '';
      setSelectedSemester(firstSemester);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const semesterGroups = useMemo(() => {
    const groupMap = new Map<string, StudentRegistration[]>();

    registrations.forEach((item) => {
      const label = item.semesterLabel || 'Chưa xác định học kỳ';
      groupMap.set(label, [...(groupMap.get(label) ?? []), item]);
    });

    (academic?.semesters ?? []).forEach((semester) => {
      if (!groupMap.has(semester.label)) {
        groupMap.set(semester.label, []);
      }
    });

    return Array.from(groupMap.entries()).map(([label, items]) => ({
      label,
      registrations: items,
      credits: items.reduce((total, item) => total + item.credits, 0),
    }));
  }, [academic?.semesters, registrations]);

  const selectedGroup = useMemo<SemesterGroup | null>(() => {
    if (semesterGroups.length === 0) return null;
    return semesterGroups.find((group) => group.label === selectedSemester) ?? semesterGroups[0];
  }, [selectedSemester, semesterGroups]);

  const totalCredits = useMemo(
    () => registrations.reduce((total, item) => total + item.credits, 0),
    [registrations],
  );

  const filteredSchedules = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return schedules;

    return schedules.filter((item) =>
      [item.courseCode, item.courseName, item.classCode, item.room, item.lecturer]
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [query, schedules]);

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Học kỳ và thời khóa biểu</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Xem các học phần đã đăng ký theo từng học kỳ và lịch học tuần hiện tại.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard
          icon={<GraduationCap className="h-4 w-4 text-emerald-600" />}
          label="Tổng kỳ đã học"
          value={semesterGroups.length}
          suffix="học kỳ"
        />
        <SummaryCard
          icon={<BookOpen className="h-4 w-4 text-blue-600" />}
          label="Tổng học phần"
          value={registrations.length}
          suffix="học phần"
        />
        <SummaryCard
          icon={<CalendarDays className="h-4 w-4 text-violet-600" />}
          label="Tổng tín chỉ đăng ký"
          value={academic?.accumulatedCredits || totalCredits}
          suffix="tín chỉ"
        />
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Học phần theo học kỳ
            </CardTitle>
            {selectedGroup && (
              <Badge variant="secondary">
                {selectedGroup.registrations.length} học phần / {selectedGroup.credits} tín chỉ
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {semesterGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onClick={() => setSelectedSemester(group.label)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedGroup?.label === group.label
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <span className="block font-semibold">{group.label}</span>
                <span className="mt-1 block text-xs opacity-75">
                  {group.registrations.length} học phần, {group.credits} tín chỉ
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="w-32 px-4 py-3">Mã học phần</th>
                  <th className="px-4 py-3">Tên học phần</th>
                  <th className="w-36 px-4 py-3">Lớp học phần</th>
                  <th className="w-24 px-4 py-3">Tín chỉ</th>
                  <th className="w-44 px-4 py-3">Đợt đăng ký</th>
                  <th className="w-32 px-4 py-3">Trạng thái</th>
                  <th className="w-28 px-4 py-3">Học phí</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGroup?.registrations ?? []).map((item) => (
                  <tr key={item.registrationId} className="border-t border-slate-100 align-top transition hover:bg-emerald-50/40 dark:border-slate-800 dark:hover:bg-emerald-950/10">
                    <td className="px-4 py-4 font-semibold uppercase text-emerald-600">{item.courseCode}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950 dark:text-white">{item.courseName}</p>
                      <p className="mt-1 text-xs text-slate-500">Đăng ký: {item.registeredAt}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{item.classCode}</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{item.credits}</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{item.registrationPeriodName}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{formatRegistrationStatus(item.status)}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={item.paid ? 'secondary' : 'destructive'}>
                        {item.paid ? 'Đã nộp' : 'Chưa nộp'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(selectedGroup?.registrations.length ?? 0) === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700">
              Chưa có học phần đăng ký trong học kỳ này.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm môn, lớp, phòng hoặc giảng viên"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{filteredSchedules.length} buổi học</Badge>
            <Badge variant="outline">Tuần hiện tại</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Bảng thời khóa biểu
            </CardTitle>
            <span className="text-xs text-slate-500">Sắp theo ngày học trong tuần</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="w-32 px-4 py-3">Ngày học</th>
                  <th className="w-40 px-4 py-3">Ca học</th>
                  <th className="px-4 py-3">Học phần</th>
                  <th className="w-40 px-4 py-3">Lớp</th>
                  <th className="w-32 px-4 py-3">Phòng</th>
                  <th className="w-52 px-4 py-3">Giảng viên</th>
                  <th className="w-28 px-4 py-3">Hình thức</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((item) => (
                  <tr key={item.id} className={`border-t border-slate-100 align-top transition hover:bg-emerald-50/40 dark:border-slate-800 dark:hover:bg-emerald-950/10 ${item.isCancelled ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-4">
                      {item.isCancelled && <Badge variant="destructive" className="mb-1">Đã hủy</Badge>}
                      {item.overrideType === 'MAKEUP' && <Badge variant="default" className="mb-1 bg-blue-500 hover:bg-blue-600">Học bù</Badge>}
                      {item.overrideType === 'ROOM_CHANGE' && <Badge variant="outline" className="mb-1 border-orange-500 text-orange-600">Đổi phòng</Badge>}
                      {item.overrideType === 'EXTRA' && <Badge variant="default" className="mb-1 bg-purple-500 hover:bg-purple-600">Tăng tiết</Badge>}
                      <p className={`font-semibold text-slate-950 dark:text-white ${item.isCancelled ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>{item.dayLabel}</p>
                      <p className={`mt-1 text-xs text-slate-500 ${item.isCancelled ? 'line-through' : ''}`}>{item.dateLabel}</p>
                    </td>
                    <td className={`px-4 py-4 font-medium text-slate-700 dark:text-slate-200 ${item.isCancelled ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>{item.time}</td>
                    <td className="px-4 py-4">
                      <p className={`font-semibold text-slate-950 dark:text-white ${item.isCancelled ? 'text-slate-400 dark:text-slate-500' : ''}`}>{item.courseName}</p>
                      <p className={`mt-1 text-xs font-semibold uppercase ${item.isCancelled ? 'text-slate-400' : 'text-emerald-600'}`}>{item.courseCode}</p>
                    </td>
                    <td className={`px-4 py-4 text-slate-700 dark:text-slate-200 ${item.isCancelled ? 'text-slate-400 dark:text-slate-500' : ''}`}>{item.classCode}</td>
                    <td className={`px-4 py-4 text-slate-700 dark:text-slate-200 ${item.isCancelled ? 'text-slate-400 dark:text-slate-500' : (item.overrideType === 'ROOM_CHANGE' ? 'font-bold text-orange-600 dark:text-orange-400' : '')}`}>{item.room}</td>
                    <td className={`px-4 py-4 text-slate-700 dark:text-slate-200 ${item.isCancelled ? 'text-slate-400 dark:text-slate-500' : ''}`}>{item.lecturer}</td>
                    <td className="px-4 py-4"><Badge variant="outline">{item.mode}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSchedules.length === 0 && (
            <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
              Không tìm thấy buổi học phù hợp.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {value} <span className="text-sm font-medium text-slate-500">{suffix}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatRegistrationStatus(status: number | null) {
  if (status === null || status === undefined) return 'Chưa xác định';
  return STATUS_LABELS[status] ?? `Trạng thái ${status}`;
}
