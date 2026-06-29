"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, CalendarClock, CheckCircle2, ChevronRight, Clock, FileCheck2, Info, Loader2, PlayCircle, TrendingUp, Users } from "lucide-react";
import { scheduleApi } from "@/features/education/api/schedule";
import { useAuth } from "@/features/education/context/AuthContext";
import { request } from "@/features/education/utils/request";

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const getEmployeeIdFromMe = async () => {
  const res: any = await request.get("/api/auth/me");
  return res?.employeeId || res?.data?.employeeId || res?.data?.data?.employeeId || null;
};

const formatTime = (start?: string, end?: string) => {
  const trim = (value?: string) => String(value || "").slice(0, 5);
  return `${trim(start) || "--:--"} - ${trim(end) || "--:--"}`;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
};

const courseProgress = {
  code: "CNW202",
  name: "Công nghệ Web nâng cao",
  className: "WEB101 - HK2",
  completedLessons: 13,
  totalLessons: 20,
  progress: 65,
  activeStudents: 48,
  averageScore: 8.1,
  nextLesson: "Quản lý State với useState & useEffect",
  modules: [
    {
      title: "Kiến trúc Web & môi trường phát triển",
      meta: "4 bài học - 2h 15p",
      progress: 100,
      status: "Hoàn thành",
    },
    {
      title: "Xây dựng UI với React & Hooks",
      meta: "6 bài học - 4h 30p",
      progress: 50,
      status: "Đang học",
    },
    {
      title: "API & Backend với Express.js",
      meta: "5 bài học - 5h 00p",
      progress: 0,
      status: "Sắp mở",
    },
  ],
};

export default function LecturerDashboard() {
  const { user, updateUser } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>((user as any)?.id || null);
  const [classes, setClasses] = useState<any[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((user as any)?.id) {
      setEmployeeId((user as any).id);
      return;
    }

    if (!user) return;

    getEmployeeIdFromMe()
      .then((id) => {
        if (id) {
          setEmployeeId(id);
          updateUser({ id });
        }
      })
      .catch(() => {});
  }, [user, updateUser]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const now = new Date();
        const [classesRes, calendarRes] = await Promise.all([
          scheduleApi.getTeachingProgress({ instructorId: employeeId }),
          scheduleApi.getCalendar({
            instructorId: employeeId,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          }),
        ]);

        const classRows = toArray(classesRes);
        const calendarDays = toArray(calendarRes);
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const schedules = calendarDays
          .flatMap((day: any) =>
            toArray(day.items).map((item: any) => ({
              ...item,
              date: day.date,
            })),
          )
          .filter((item: any) => new Date(`${item.date}T${item.startTime || "00:00:00"}`).getTime() >= todayStart)
          .sort((a: any, b: any) => {
            return new Date(`${a.date}T${a.startTime || "00:00:00"}`).getTime()
              - new Date(`${b.date}T${b.startTime || "00:00:00"}`).getTime();
          });

        setClasses(classRows);
        setUpcomingSchedules(schedules);
      } catch (error) {
        console.error("Loi khi tai dashboard giang vien", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [employeeId, user]);

  const stats = useMemo(() => {
    const requiredPeriods = classes.reduce((sum, item) => sum + Number(item.requiredPeriods || 0), 0);
    const taughtPeriods = classes.reduce((sum, item) => sum + Number(item.taughtPeriods || 0), 0);
    const remainingPeriods = classes.reduce((sum, item) => sum + Number(item.remainingPeriods || 0), 0);

    return {
      classesCount: classes.length,
      scheduleCount: upcomingSchedules.length,
      taughtPeriods,
      remainingPeriods,
      requiredPeriods,
    };
  }, [classes, upcomingSchedules]);

  const nextSchedules = upcomingSchedules.slice(0, 3);
  const displayName = user?.fullName || (user as any)?.name || "Giảng viên";

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Xin chào, {displayName}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Tổng quan lịch giảng dạy và lớp học phần đang phụ trách của bạn.
        </p>
      </div>

      {!employeeId && !loading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Chưa lấy được mã giảng viên từ phiên đăng nhập. Hãy đăng xuất và đăng nhập lại để đồng bộ dữ liệu.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Lớp phụ trách" value={stats.classesCount} hint="Theo phân công" tone="emerald" loading={loading} />
        <StatCard icon={CalendarClock} label="Lịch sắp tới" value={stats.scheduleCount} hint="Trong tháng này" tone="sky" loading={loading} />
        <StatCard icon={CheckCircle2} label="Tiết đã dạy" value={stats.taughtPeriods} hint={`/${stats.requiredPeriods || 0} tiết yêu cầu`} tone="indigo" loading={loading} />
        <StatCard icon={Clock} label="Tiết còn lại" value={stats.remainingPeriods} hint="Cần hoàn thành" tone="amber" loading={loading} />
      </div>

      <LearningProgressOverview />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-3xl border border-gray-200/50 bg-white/70 p-6 shadow-sm dark:border-gray-800/50 dark:bg-gray-900/40 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lịch giảng dạy sắp tới</h3>
              <p className="mt-1 text-xs text-slate-500">Dữ liệu được lọc theo chính tài khoản giảng viên hiện tại.</p>
            </div>
            <Link href="/education/dashboard/lecturer/my-schedule" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Xem lịch <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 flex-1 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tải dữ liệu giảng viên...
              </div>
            ) : nextSchedules.length > 0 ? (
              nextSchedules.map((item, index) => (
                <div
                  key={item.id || `${item.date}-${item.timeSlotId}-${index}`}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition hover:border-brand-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex min-w-[120px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      <span className="text-[11px] font-bold text-slate-500">{formatDate(item.date)}</span>
                      <span className="text-xs font-black text-brand-600">{formatTime(item.startTime, item.endTime)}</span>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 transition group-hover:text-brand-600 dark:text-white">
                          {item.courseClassName || item.courseClassCode || "Lớp học phần"}
                        </p>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${item.mode === "TH" ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700"}`}>
                          {item.mode || "LT"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.courseName || "Tên học phần"}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <Info size={14} className="text-brand-500" /> {item.roomCode || "Chưa xếp phòng"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <Clock className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="font-medium text-gray-500">Chưa có lịch giảng dạy sắp tới trong tháng này</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/50 bg-white/70 p-6 shadow-sm dark:border-gray-800/50 dark:bg-gray-900/40">
          <div className="border-b border-gray-100 pb-4 dark:border-gray-800/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lớp nổi bật</h3>
            <p className="mt-1 text-xs text-slate-500">Các lớp có khối lượng còn lại cao.</p>
          </div>
          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-500">Đang tải lớp phụ trách...</div>
            ) : classes.length > 0 ? (
              [...classes]
                .sort((a, b) => Number(b.remainingPeriods || 0) - Number(a.remainingPeriods || 0))
                .slice(0, 3)
                .map((item, index) => (
                  <Link
                    href="/education/dashboard/lecturer/my-classes"
                    key={item.courseClassId || index}
                    className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.courseClassCode || "Mã lớp"}</div>
                        <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.courseName || "Tên học phần"}</div>
                        <div className="mt-2 text-[11px] font-semibold text-emerald-700">
                          Còn {item.remainingPeriods || 0} tiết
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                Chưa có lớp phụ trách
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningProgressOverview() {
  return (
    <section className="grid grid-cols-1 gap-6 rounded-3xl border border-gray-200/50 bg-white/80 p-5 shadow-sm dark:border-gray-800/50 dark:bg-gray-900/50 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <BarChart3 className="h-4 w-4" />
              Tiến độ học tập
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
              {courseProgress.code}: {courseProgress.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Theo dõi tiến độ nội dung, bài đang học và mức độ hoàn thành của lớp {courseProgress.className}.
            </p>
          </div>

          <Link
            href="/education/dashboard/lecturer/learning-progress"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <PlayCircle className="h-4 w-4" />
            Xem tiến độ
          </Link>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Hoàn thành {courseProgress.progress}% học phần</p>
              <p className="mt-1 text-xs text-slate-500">
                {courseProgress.completedLessons}/{courseProgress.totalLessons} bài học đã hoàn thành
              </p>
            </div>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{courseProgress.progress}%</div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white shadow-inner dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${courseProgress.progress}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {courseProgress.modules.map((module) => (
            <div
              key={module.title}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-emerald-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${module.progress === 100 ? "bg-emerald-100 text-emerald-700" : module.progress > 0 ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                    {module.progress === 100 ? <CheckCircle2 className="h-5 w-5" /> : module.progress > 0 ? <PlayCircle className="h-5 w-5" /> : <FileCheck2 className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{module.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{module.meta}</p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  {module.status}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-900">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${module.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-800/40">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tổng quan lớp</h3>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ProgressMetric icon={Users} label="Sinh viên" value={courseProgress.activeStudents} />
          <ProgressMetric icon={TrendingUp} label="Điểm TB" value={courseProgress.averageScore} />
        </div>
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-400">Bài tiếp theo</p>
          <p className="mt-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">{courseProgress.nextLesson}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Gợi ý mở trước nội dung và tài liệu để chuẩn bị hoạt động thảo luận trên lớp.
          </p>
        </div>
      </aside>
    </section>
  );
}

function ProgressMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <Icon className="h-5 w-5 text-emerald-600" />
      <p className="mt-3 text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone, loading }: { icon: any; label: string; value: number; hint: string; tone: "emerald" | "sky" | "indigo" | "amber"; loading: boolean }) {
  const toneClass = {
    emerald: "from-emerald-50 to-emerald-100 text-emerald-700",
    sky: "from-sky-50 to-sky-100 text-sky-700",
    indigo: "from-indigo-50 to-indigo-100 text-indigo-700",
    amber: "from-amber-50 to-amber-100 text-amber-700",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-3xl border border-gray-200/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition hover:shadow-lg dark:border-gray-800/50 dark:bg-gray-900/40">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        <h4 className="mt-2 text-3xl font-black text-gray-800 dark:text-white">{loading ? "..." : value}</h4>
        <p className="mt-1 inline-block rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{hint}</p>
      </div>
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass}`}>
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );
}
