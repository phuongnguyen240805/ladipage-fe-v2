'use client';

import { studentPortalApi } from '@/features/education/api/student-portal';
import { Badge } from '@/features/education/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/education/components/ui/card';
import type { StudentAcademicResult } from '@/features/education/types/student-portal';
import { Award, BookCheck, GraduationCap, TrendingUp } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

export default function StudentAcademicResultsPage() {
  const [result, setResult] = useState<StudentAcademicResult | null>(null);
  const [filterMode, setFilterMode] = useState<'single' | 'range'>('single');
  const [singleSemester, setSingleSemester] = useState('');
  const [fromSemester, setFromSemester] = useState('');
  const [toSemester, setToSemester] = useState('');

  useEffect(() => {
    studentPortalApi.getAcademicResult().then((payload) => {
      setResult(payload.data);
      const currentSemester = payload.data.semesters.at(-2)?.id || payload.data.semesters[0]?.id || '';
      setSingleSemester(currentSemester);
      setFromSemester(payload.data.semesters[0]?.id || '');
      setToSemester(currentSemester);
    });
  }, []);

  const semesterOrder = result?.semesters.map((semester) => semester.id) ?? [];
  const filteredGrades = useMemo(() => {
    if (!result) return [];
    if (filterMode === 'single') return result.grades.filter((grade) => grade.semesterId === singleSemester);

    const fromIndex = semesterOrder.indexOf(fromSemester);
    const toIndex = semesterOrder.indexOf(toSemester);
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);

    return result.grades.filter((grade) => {
      const index = semesterOrder.indexOf(grade.semesterId);
      return start >= 0 && end >= 0 && index >= start && index <= end;
    });
  }, [filterMode, fromSemester, result, semesterOrder, singleSemester, toSemester]);

  const passedCredits = filteredGrades.filter((grade) => grade.status === 'Đạt').reduce((total, grade) => total + grade.credits, 0);
  const registeredCredits = filteredGrades.reduce((total, grade) => total + grade.credits, 0);
  const gpaCredits = filteredGrades.filter((grade) => grade.gradePoint !== null).reduce((total, grade) => total + grade.credits, 0);
  const filterGpa = gpaCredits
    ? filteredGrades.reduce((total, grade) => total + (grade.gradePoint ?? 0) * grade.credits, 0) / gpaCredits
    : 0;

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Kết quả học tập</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi điểm học kỳ, tín chỉ đạt và các học phần cần chú ý.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultMetric icon={Award} label="GPA tích lũy" value={result?.cumulativeGpa.toFixed(2) || '--'} />
        <ResultMetric icon={TrendingUp} label="GPA học kỳ" value={result?.semesterGpa.toFixed(2) || '--'} />
        <ResultMetric icon={GraduationCap} label="Tín chỉ chương trình" value={result ? `${result.accumulatedCredits}/${result.programCredits}` : '--'} />
        <ResultMetric icon={BookCheck} label="Tín chỉ đạt kỳ này" value={`${passedCredits}`} />
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 xl:grid-cols-[auto_1fr] xl:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('single')}
              className={`h-10 rounded-lg border px-4 text-sm font-semibold transition ${filterMode === 'single' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'}`}
            >
              Xem 1 kỳ
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('range')}
              className={`h-10 rounded-lg border px-4 text-sm font-semibold transition ${filterMode === 'range' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'}`}
            >
              Từ kỳ - đến kỳ
            </button>
          </div>

          {filterMode === 'single' ? (
            <SemesterSelect label="Học kỳ" value={singleSemester} onChange={setSingleSemester} semesters={result?.semesters ?? []} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <SemesterSelect label="Từ kỳ" value={fromSemester} onChange={setFromSemester} semesters={result?.semesters ?? []} />
              <SemesterSelect label="Đến kỳ" value={toSemester} onChange={setToSemester} semesters={result?.semesters ?? []} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Bảng điểm theo bộ lọc</CardTitle>
            <Badge variant="secondary">{filteredGrades.length} học phần</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">Học phần</th>
                  <th className="px-4 py-3">Tín chỉ</th>
                  <th className="px-4 py-3">Quá trình</th>
                  <th className="px-4 py-3">Thi</th>
                  <th className="px-4 py-3">Tổng kết</th>
                  <th className="px-4 py-3">Hệ 4</th>
                  <th className="px-4 py-3">Điểm chữ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950 dark:text-white">{grade.courseName}</p>
                      <p className="text-xs text-slate-500">{grade.courseCode} · {grade.semesterLabel}</p>
                    </td>
                    <td className="px-4 py-3">{grade.credits}</td>
                    <td className="px-4 py-3">{formatScore(grade.processScore)}</td>
                    <td className="px-4 py-3">{formatScore(grade.examScore)}</td>
                    <td className="px-4 py-3 font-semibold">{formatScore(grade.finalScore)}</td>
                    <td className="px-4 py-3 font-semibold">{formatGradePoint(grade.gradePoint)}</td>
                    <td className="px-4 py-3">{grade.letterGrade}</td>
                    <td className="px-4 py-3"><GradeStatus status={grade.status} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-emerald-100 bg-emerald-50/60 text-slate-800 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold">
                    Tổng kết GPA theo bộ lọc
                    <p className="mt-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                      {filteredGrades.length} học phần
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{registeredCredits}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tín chỉ đăng ký</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{passedCredits}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tín chỉ đạt</p>
                  </td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{filterGpa ? filterGpa.toFixed(2) : '--'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">GPA hệ 4</p>
                  </td>
                  <td className="px-4 py-3">--</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">Đã tổng hợp</Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {filteredGrades.length === 0 && (
            <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
              Không có kết quả trong kỳ đã chọn.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function ResultMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-xs font-semibold uppercase text-slate-400">{label}</span>
          <span className="block text-xl font-bold text-slate-950 dark:text-white">{value}</span>
        </span>
      </CardContent>
    </Card>
  );
}

function GradeStatus({ status }: { status: StudentAcademicResult['grades'][number]['status'] }) {
  const variant = status === 'Đạt' ? 'secondary' : status === 'Đang học' ? 'outline' : 'destructive';
  return <Badge variant={variant}>{status}</Badge>;
}

function SemesterSelect({
  label,
  value,
  onChange,
  semesters,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  semesters: StudentAcademicResult['semesters'];
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {semesters.map((semester) => (
          <option key={semester.id} value={semester.id}>{semester.label}</option>
        ))}
      </select>
    </label>
  );
}

function formatScore(score: number | null) {
  return score === null ? '--' : score.toFixed(1);
}

function formatGradePoint(score: number | null) {
  return score === null ? '--' : score.toFixed(1);
}
