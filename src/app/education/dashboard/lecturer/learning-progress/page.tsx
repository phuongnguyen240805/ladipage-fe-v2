"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FileQuestion,
  FileText,
  Lightbulb,
  Lock,
  Play,
  PlayCircle,
  UserRound,
  Users,
} from "lucide-react";

type Lesson = {
  title: string;
  meta: string;
  kind: "video" | "document" | "quiz" | "assignment";
  done?: boolean;
  active?: boolean;
  locked?: boolean;
  score?: string;
};

type Module = {
  id: string;
  chapter: string;
  title: string;
  meta: string;
  status: "completed" | "active" | "locked";
  progress: number;
  lessons: Lesson[];
};

const course = {
  code: "CNW202",
  title: "Công nghệ Web nâng cao với React & Node.js",
  category: "Phát triển phần mềm",
  lecturer: "TS. Nguyễn Văn A",
  department: "Giảng viên cao cấp - Khoa CNTT",
  progress: 65,
  completedLessons: 13,
  totalLessons: 20,
  totalDuration: "32 giờ 45 phút",
  students: "1,250 sinh viên",
  language: "Tiếng Việt, phụ đề Tiếng Anh",
  certificate: "Chứng nhận hoàn thành ĐH EduCore",
};

const modules: Module[] = [
  {
    id: "module-1",
    chapter: "Chương 01",
    title: "Kiến trúc Web & môi trường phát triển",
    meta: "4 bài học - 2h 15p",
    status: "completed",
    progress: 100,
    lessons: [
      { title: "1.1. Tổng quan về kiến trúc Client-Server hiện đại", meta: "Video - 15:00", kind: "video", done: true },
      { title: "1.2. Thiết lập Node.js & NPM cho dự án thực tế", meta: "Tài liệu - 10 trang", kind: "document", done: true },
      { title: "Trắc nghiệm kiến thức Chương 1", meta: "Kiểm tra - 15 câu", kind: "quiz", done: true, score: "10/10" },
    ],
  },
  {
    id: "module-2",
    chapter: "Chương 02 - Đang học",
    title: "Xây dựng UI với React & Hooks",
    meta: "6 bài học - 4h 30p",
    status: "active",
    progress: 50,
    lessons: [
      { title: "2.1. Tìm hiểu Virtual DOM và JSX", meta: "Video - 22:00", kind: "video", done: true },
      { title: "2.2. Quản lý State với useState & useEffect", meta: "Video - 45:00 - Tiếp tục", kind: "video", active: true },
      { title: "2.3. Quy tắc của Hooks và Custom Hooks", meta: "Tài liệu - 15 trang", kind: "document", locked: true },
      { title: "Bài tập: Xây dựng Todo App với Hooks", meta: "Bài tập - Deadline: 3 ngày nữa", kind: "assignment", locked: true },
    ],
  },
  {
    id: "module-3",
    chapter: "Chương 03",
    title: "API & Backend với Express.js",
    meta: "5 bài học - 5h 00p",
    status: "locked",
    progress: 0,
    lessons: [],
  },
];

export default function LecturerLearningProgressPage() {
  const [openModules, setOpenModules] = useState<string[]>(["module-1", "module-2"]);

  const toggleModule = (id: string) => {
    setOpenModules((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const expandAll = () => {
    setOpenModules((current) => (current.length === modules.length ? [] : modules.map((module) => module.id)));
  };

  return (
    <div className="space-y-8">
      <CourseHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="space-y-4 xl:col-span-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-600">Tiến độ học tập</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Nội dung chương trình</h2>
            </div>
            <button
              type="button"
              onClick={expandAll}
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 transition hover:text-emerald-800"
            >
              {openModules.length === modules.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {modules.map((module) => {
            const isOpen = openModules.includes(module.id);

            return (
              <article
                key={module.id}
                className={`overflow-hidden rounded-2xl bg-white shadow-sm transition dark:bg-slate-900 ${
                  module.status === "active"
                    ? "border-2 border-emerald-200 shadow-md dark:border-emerald-900/70"
                    : "border border-slate-200 dark:border-slate-800"
                } ${module.status === "locked" ? "opacity-80" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className={`flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between ${
                    module.status === "active" ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-slate-50/70 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <ModuleIcon status={module.status} />
                    <div className="min-w-0">
                      <span className={`text-xs font-bold uppercase tracking-wide ${module.status === "active" ? "text-emerald-700" : "text-slate-500"}`}>
                        {module.chapter}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{module.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm dark:bg-slate-900">
                      {module.meta}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <div className="h-2 bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-emerald-600" style={{ width: `${module.progress}%` }} />
                </div>

                {isOpen && (
                  <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                    {module.lessons.length > 0 ? (
                      module.lessons.map((lesson) => <LessonRow key={lesson.title} lesson={lesson} />)
                    ) : (
                      <div className="p-8 text-center">
                        <Lock className="mx-auto h-9 w-9 text-slate-300" />
                        <p className="mt-2 text-sm font-medium text-slate-500">Hoàn thành Chương 02 để mở khóa chương này</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <aside className="space-y-6 xl:col-span-4">
          <CourseInfoCard />
          <SuggestedResources />
        </aside>
      </div>
    </div>
  );
}

function CourseHeader() {
  return (
    <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(280px,0.38fr)_minmax(0,1fr)]">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
        <Image
          src="/education/images/grid-image/image-03.png"
          alt="Course thumbnail"
          fill
          priority
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold uppercase text-white">
          {course.category}
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Khóa học</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-white">{course.title}</span>
        </nav>

        <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 dark:text-white">
          {course.code}: {course.title}
        </h1>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{course.lecturer}</p>
              <p className="text-xs text-slate-500">{course.department}</p>
            </div>
          </div>

          <div className="hidden h-11 w-px bg-slate-200 dark:bg-slate-800 lg:block" />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-emerald-700">Tiến độ hoàn thành: {course.progress}%</span>
              <span className="text-xs font-semibold text-slate-500">
                {course.completedLessons}/{course.totalLessons} bài học
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleIcon({ status }: { status: Module["status"] }) {
  const classes = {
    completed: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-600 text-white",
    locked: "bg-slate-100 text-slate-500 dark:bg-slate-800",
  }[status];

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${classes}`}>
      {status === "completed" && <CheckCircle2 className="h-5 w-5" />}
      {status === "active" && <PlayCircle className="h-5 w-5" />}
      {status === "locked" && <Lock className="h-5 w-5" />}
    </div>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return (
    <div
      className={`flex flex-col gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between ${
        lesson.active ? "border-l-4 border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/20" : ""
      } ${lesson.locked ? "opacity-65" : ""}`}
    >
      <div className="flex min-w-0 items-start gap-4">
        <LessonKindIcon lesson={lesson} />
        <div className="min-w-0">
          <p className={`text-sm font-bold ${lesson.active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100"}`}>
            {lesson.title}
          </p>
          <p className="mt-1 text-xs text-slate-500">{lesson.meta}</p>
        </div>
      </div>

      {lesson.active ? (
        <Link
          href="/education/dashboard/lecturer/lectures"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Học ngay
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : lesson.score ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-emerald-700">{lesson.score}</span>
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
      ) : lesson.done ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      ) : (
        <Lock className="h-5 w-5 text-slate-400" />
      )}
    </div>
  );
}

function LessonKindIcon({ lesson }: { lesson: Lesson }) {
  if (lesson.done) return <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />;
  if (lesson.locked) return <Lock className="mt-0.5 h-5 w-5 text-slate-400" />;

  const iconClassName = `mt-0.5 h-5 w-5 ${lesson.active ? "text-emerald-600" : "text-slate-500"}`;
  if (lesson.kind === "document") return <FileText className={iconClassName} />;
  if (lesson.kind === "quiz") return <FileQuestion className={iconClassName} />;
  if (lesson.kind === "assignment") return <FileText className={iconClassName} />;
  return <PlayCircle className={iconClassName} />;
}

function CourseInfoCard() {
  return (
    <section className="rounded-2xl border border-slate-200 border-t-4 border-t-emerald-600 bg-white p-5 shadow-sm dark:border-slate-800 dark:border-t-emerald-600 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin khóa học</h3>
      <div className="mt-5 space-y-4">
        <InfoItem icon={Clock3} label="Thời lượng tổng cộng" value={course.totalDuration} />
        <InfoItem icon={Users} label="Sinh viên đã tham gia" value={course.students} />
        <InfoItem icon={BookOpen} label="Ngôn ngữ" value={course.language} />
        <InfoItem icon={BarChart3} label="Chứng chỉ" value={course.certificate} />
      </div>

      <Link
        href="/education/dashboard/lecturer/lectures"
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[15px] font-bold leading-6 text-white shadow-lg transition hover:bg-emerald-700"
      >
        <Play className="h-5 w-5" />
        Tiếp tục học
      </Link>

      <button
        type="button"
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
      >
        <Download className="h-4 w-4" />
        Tải xuống tài liệu offline
      </button>
    </section>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function SuggestedResources() {
  const resources = [
    "React Documentation 2026",
    "Tailwind CSS Cheat Sheet",
    "Bộ câu hỏi ôn tập chương 2",
  ];

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
        <Lightbulb className="h-5 w-5 text-emerald-600" />
        Tài nguyên gợi ý
      </h3>
      <div className="mt-4 space-y-3">
        {resources.map((resource) => (
          <button
            key={resource}
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <span>
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{resource}</span>
              <span className="mt-0.5 block text-xs text-slate-500">Tài liệu hỗ trợ giảng dạy</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}
      </div>
    </section>
  );
}
