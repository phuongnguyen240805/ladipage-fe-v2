"use client";

import React, { useEffect, useMemo, useState } from "react";
import { scheduleApi } from "@/features/education/api/schedule";
import { useAuth } from "@/features/education/context/AuthContext";
import { request } from "@/features/education/utils/request";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Grid2X2,
  Layers3,
  Loader2,
  Search,
  Table2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/features/education/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/education/components/ui/select";

type ViewMode = "cards" | "table";

const toArray = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const normalizeDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

const ALL_SEMESTERS = "all";

export default function LecturerClassList() {
  const { user, updateUser } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>((user as any)?.id || null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(ALL_SEMESTERS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if ((user as any)?.id) {
      setEmployeeId((user as any).id);
      return;
    }

    if (!user) return;

    request.get("/api/auth/me")
      .then((res: any) => {
        const empId = res?.data?.employeeId || res?.data?.data?.employeeId || res?.employeeId;
        if (empId) {
          setEmployeeId(empId);
          updateUser({ id: empId });
        }
      })
      .catch(() => {});
  }, [user, updateUser]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await scheduleApi.getTeachingProgress({
          instructorId: employeeId,
        });
        const rows = toArray(res);
        setClasses(rows);
        if (selectedSemesterId === ALL_SEMESTERS) {
          const latestSemesterId = rows
            .map((item: any) => item.semesterId)
            .find(Boolean);
          if (latestSemesterId) {
            setSelectedSemesterId(String(latestSemesterId));
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Khong the tai danh sach lop phu trach");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [employeeId]);

  const semesters = useMemo(() => {
    const map = new Map<string, any>();
    classes.forEach((item) => {
      if (!item.semesterId || map.has(String(item.semesterId))) return;
      map.set(String(item.semesterId), {
        semesterId: String(item.semesterId),
        semesterCode: item.semesterCode,
        semesterName: item.semesterName,
        startDate: item.semesterStartDate,
        endDate: item.semesterEndDate,
      });
    });
    return [...map.values()].sort((a, b) => {
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    });
  }, [classes]);

  const selectedSemester = semesters.find((semester: any) => String(semester.semesterId) === selectedSemesterId);

  const filteredClasses = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const semesterFiltered = selectedSemesterId === ALL_SEMESTERS
      ? classes
      : classes.filter((item) => String(item.semesterId || "") === selectedSemesterId);
    if (!q) return semesterFiltered;
    return semesterFiltered.filter((item) => {
      return [
        item.courseClassCode,
        item.courseName,
        item.courseCode,
        item.departmentName,
      ].some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [classes, keyword, selectedSemesterId]);

  const summary = useMemo(() => {
    const total = filteredClasses.length;
    const required = filteredClasses.reduce((sum, item) => sum + Number(item.requiredPeriods || 0), 0);
    const taught = filteredClasses.reduce((sum, item) => sum + Number(item.taughtPeriods || 0), 0);
    const remaining = filteredClasses.reduce((sum, item) => sum + Number(item.remainingPeriods || 0), 0);
    return { total, required, taught, remaining };
  }, [filteredClasses]);

  const getProgressPercentage = (item: any) => {
    const required = Number(item.requiredPeriods || 0);
    if (!required) return 0;
    return Math.min(100, Math.round((Number(item.taughtPeriods || 0) * 100) / required));
  };

  const getAlertBadge = (status?: string) => {
    switch (status) {
      case "ON_TRACK":
        return (
          <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Dung tien do
          </Badge>
        );
      case "BEHIND":
        return (
          <Badge className="w-fit border-amber-200 bg-amber-50 text-amber-700">
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            Cham tien do
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge className="w-fit border-rose-200 bg-rose-50 text-rose-700">
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            Can xu ly
          </Badge>
        );
      default:
        return <Badge variant="outline">Chua danh gia</Badge>;
    }
  };

  if (!employeeId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Chua lay duoc ma giang vien tu phien dang nhap. Hay dang xuat va dang nhap lai de dong bo lich va lop phu trach.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Layers3 className="h-4 w-4" />
            {selectedSemester?.semesterName || selectedSemester?.semesterCode || "Tat ca hoc ky"}
          </div>
          <div className="text-xs text-slate-500">
            {selectedSemester
              ? `${normalizeDate(selectedSemester.startDate)} - ${normalizeDate(selectedSemester.endDate)}`
              : "Tat ca lop duoc phan cong"}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tim ma lop, ten hoc phan..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 sm:w-64"
            />
          </div>

          <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
            <SelectTrigger className="h-10 w-full rounded-xl bg-white dark:bg-slate-950 sm:w-56">
              <SelectValue placeholder="Chon hoc ky" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SEMESTERS}>Tat ca hoc ky</SelectItem>
              {semesters.map((semester: any) => (
                <SelectItem key={semester.semesterId} value={semester.semesterId}>
                  {semester.semesterName || semester.semesterCode || "Hoc ky"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex h-10 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("cards")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
                viewMode === "cards" ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-950" : "text-slate-500"
              }`}
            >
              <Grid2X2 className="h-4 w-4" />
              The
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
                viewMode === "table" ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-950" : "text-slate-500"
              }`}
            >
              <Table2 className="h-4 w-4" />
              Bang
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile icon={BookOpen} label="Lop phu trach" value={summary.total} tone="emerald" />
        <SummaryTile icon={Clock} label="Tiet yeu cau" value={summary.required} tone="slate" />
        <SummaryTile icon={CheckCircle2} label="Da day" value={summary.taught} tone="blue" />
        <SummaryTile icon={AlertCircle} label="Con lai" value={summary.remaining} tone="amber" />
      </div>

      {loading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/60 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          Dang tai lop phu trach...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <BookOpen className="mb-3 h-12 w-12 text-slate-300" />
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">Chua co lop trong hoc ky nay</div>
          <div className="mt-1 text-sm text-slate-500">Hay chon hoc ky khac hoac kiem tra phan cong giang day.</div>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredClasses.map((item, index) => (
            <ClassCard key={item.courseClassId || index} item={item} progress={getProgressPercentage(item)} badge={getAlertBadge(item.alertStatus)} />
          ))}
        </div>
      ) : (
        <ClassTable classes={filteredClasses} getProgressPercentage={getProgressPercentage} getAlertBadge={getAlertBadge} />
      )}
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "emerald" | "slate" | "blue" | "amber" }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    blue: "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase text-slate-400">{label}</div>
    </div>
  );
}

function ClassCard({ item, progress, badge }: { item: any; progress: number; badge: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{item.courseClassCode || "Chua co ma lop"}</Badge>
              {badge}
            </div>
            <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">{item.courseName || "Chua co ten hoc phan"}</h3>
            <div className="mt-1 text-sm text-slate-500">{item.courseCode || "Hoc phan"} · {item.credits || 0} tin chi</div>
          </div>
          <button className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
        <InfoPill icon={CalendarDays} label="Bat dau" value={normalizeDate(item.startDate)} />
        <InfoPill icon={CalendarDays} label="Ket thuc" value={normalizeDate(item.endDate)} />
        <InfoPill icon={Clock} label="Da day" value={`${item.taughtPeriods || 0}/${item.requiredPeriods || 0}`} />
        <InfoPill icon={Users} label="Con lai" value={`${item.remainingPeriods || 0} tiet`} />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500">Tien do giang day</span>
          <span className="text-emerald-700">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

function ClassTable({ classes, getProgressPercentage, getAlertBadge }: { classes: any[]; getProgressPercentage: (item: any) => number; getAlertBadge: (status?: string) => React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
            <tr>
              <th className="px-5 py-4">Lop hoc phan</th>
              <th className="px-5 py-4">Hoc phan</th>
              <th className="px-5 py-4 text-center">Tin chi</th>
              <th className="px-5 py-4">Thoi gian</th>
              <th className="px-5 py-4 text-center">Tien do</th>
              <th className="px-5 py-4">Trang thai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {classes.map((item, index) => {
              const progress = getProgressPercentage(item);
              return (
                <tr key={item.courseClassId || index} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{item.courseClassCode || "-"}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{item.courseName || "-"}</div>
                    <div className="text-xs text-slate-400">{item.courseCode || "Hoc phan"}</div>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">{item.credits || 0}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{normalizeDate(item.startDate)} - {normalizeDate(item.endDate)}</td>
                  <td className="px-5 py-4">
                    <div className="mx-auto w-36">
                      <div className="mb-1 flex justify-between text-[11px] font-semibold">
                        <span>{item.taughtPeriods || 0}/{item.requiredPeriods || 0}</span>
                        <span className="text-emerald-700">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{getAlertBadge(item.alertStatus)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
