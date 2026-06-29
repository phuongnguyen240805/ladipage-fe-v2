"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import OwncastLiveEmbed from "@/features/education/components/ems/lecturer/OwncastLiveEmbed";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  MessageSquareText,
  NotebookPen,
  PlayCircle,
  Search,
  UploadCloud,
  Video,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  duration: string;
  section: string;
  status: "completed" | "current" | "upcoming";
  videoId: string;
  description: string;
  views: number;
  updatedAt: string;
};

const lessons: Lesson[] = [
  {
    id: "lesson-01",
    title: "Bài 1: Tổng quan học phần và chuẩn đầu ra",
    duration: "18:20",
    section: "Phần 1: Khởi động học phần",
    status: "completed",
    videoId: "ysz5S6PUM-U",
    views: 128,
    updatedAt: "12/05/2026",
    description:
      "Giảng viên rà soát mục tiêu học phần, cách tổ chức buổi học, tiêu chí đánh giá và các mốc sinh viên cần hoàn thành.",
  },
  {
    id: "lesson-02",
    title: "Bài 2: Thiết kế nội dung bài giảng số",
    duration: "32:45",
    section: "Phần 1: Khởi động học phần",
    status: "current",
    videoId: "ysz5S6PUM-U",
    views: 246,
    updatedAt: "18/05/2026",
    description:
      "Bài giảng tập trung vào cách chia nhỏ nội dung, xây dựng luồng học tập và chuẩn bị tài liệu đi kèm cho từng phiên học.",
  },
  {
    id: "lesson-03",
    title: "Bài 3: Minh họa ví dụ và hoạt động trên lớp",
    duration: "27:10",
    section: "Phần 2: Tổ chức lớp học",
    status: "upcoming",
    videoId: "ysz5S6PUM-U",
    views: 94,
    updatedAt: "22/05/2026",
    description:
      "Gợi ý cách chuyển ví dụ lý thuyết thành hoạt động thảo luận, bài tập nhanh và câu hỏi kiểm tra mức độ hiểu bài.",
  },
  {
    id: "lesson-04",
    title: "Bài 4: Tổng kết và phản hồi sau buổi học",
    duration: "21:35",
    section: "Phần 2: Tổ chức lớp học",
    status: "upcoming",
    videoId: "ysz5S6PUM-U",
    views: 76,
    updatedAt: "24/05/2026",
    description:
      "Hướng dẫn giảng viên ghi nhận phản hồi, cập nhật nội dung buổi tiếp theo và lưu lại minh chứng giảng dạy.",
  },
];

const tabs = [
  { id: "description", label: "Mô tả bài học", icon: BookOpen },
  { id: "resources", label: "Tài liệu", icon: FileText },
  { id: "discussion", label: "Thảo luận", icon: MessageSquareText },
  { id: "notes", label: "Ghi chú", icon: NotebookPen },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function LecturerLecturesPage() {
  const [activeLessonId, setActiveLessonId] = useState("lesson-02");
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [search, setSearch] = useState("");

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) || lessons[0];
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLesson.id);

  const filteredLessons = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return lessons;
    return lessons.filter((lesson) =>
      [lesson.title, lesson.section, lesson.description].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [search]);

  const groupedLessons = useMemo(() => {
    return filteredLessons.reduce<Record<string, Lesson[]>>((groups, lesson) => {
      groups[lesson.section] = [...(groups[lesson.section] || []), lesson];
      return groups;
    }, {});
  }, [filteredLessons]);

  const goToLesson = (direction: "prev" | "next") => {
    const nextIndex = direction === "prev" ? activeIndex - 1 : activeIndex + 1;
    if (lessons[nextIndex]) setActiveLessonId(lessons[nextIndex].id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-600">Kho bài giảng</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Xem bài giảng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Theo dõi nội dung video, tài liệu và ghi chú phục vụ giảng dạy.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/education/dashboard/lecturer/lecture-editor"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <UploadCloud className="h-4 w-4" />
            Tải lên / chỉnh sửa
          </Link>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm bài giảng..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 md:w-64"
            />
          </div>
        </div>
      </div>

      <OwncastLiveEmbed />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-black shadow-sm dark:border-slate-800">
            <div className="aspect-video">
              <iframe
                key={activeLesson.id}
                src={`https://www.youtube.com/embed/${activeLesson.videoId}`}
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">
                    <Video className="h-3.5 w-3.5" />
                    Video bài giảng
                  </span>
                  <span>{activeLesson.updatedAt}</span>
                  <span>{activeLesson.views.toLocaleString("vi-VN")} lượt xem</span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">{activeLesson.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{activeLesson.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToLesson("prev")}
                  disabled={activeIndex <= 0}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => goToLesson("next")}
                  disabled={activeIndex >= lessons.length - 1}
                  className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tiếp theo
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex min-h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${
                      isActive
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              {activeTab === "description" && <DescriptionPanel lesson={activeLesson} />}
              {activeTab === "resources" && <ResourcesPanel />}
              {activeTab === "discussion" && <DiscussionPanel />}
              {activeTab === "notes" && <NotesPanel />}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-hidden">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Nội dung học phần</h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-1/2 rounded-full bg-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-500">50%</span>
            </div>
          </div>

          <div className="max-h-[620px] overflow-y-auto">
            {Object.entries(groupedLessons).map(([section, sectionLessons]) => (
              <div key={section} className="border-b border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{section}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{sectionLessons.length} bài giảng</p>
                </div>
                {sectionLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`relative flex w-full items-start gap-3 border-t border-slate-100 px-4 py-3 text-left transition dark:border-slate-800 ${
                      lesson.id === activeLesson.id
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <LessonStatusIcon lesson={lesson} active={lesson.id === activeLesson.id} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`line-clamp-2 text-sm font-semibold ${
                          lesson.id === activeLesson.id ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {lesson.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {lesson.duration}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonStatusIcon({ lesson, active }: { lesson: Lesson; active: boolean }) {
  if (lesson.status === "completed") {
    return <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />;
  }

  return <PlayCircle className={`mt-0.5 h-5 w-5 ${active ? "text-emerald-600" : "text-slate-400"}`} />;
}

function DescriptionPanel({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
      <p>{lesson.description}</p>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white">Nội dung chính</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Chuẩn bị cấu trúc bài giảng theo mục tiêu học phần.</li>
          <li>Gắn video, tài liệu và hoạt động thảo luận vào từng buổi học.</li>
          <li>Theo dõi tiến độ nội dung để hỗ trợ sinh viên kịp thời.</li>
        </ul>
      </div>
    </div>
  );
}

function ResourcesPanel() {
  const resources = [
    { name: "Ke_hoach_bai_giang.pdf", meta: "PDF - 2.4 MB" },
    { name: "Slide_noi_dung_buoi_hoc.pptx", meta: "PowerPoint - 8.1 MB" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resources.map((resource) => (
        <button
          key={resource.name}
          type="button"
          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:hover:bg-emerald-950/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <FileText className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{resource.name}</span>
            <span className="text-xs text-slate-500">{resource.meta}</span>
          </span>
          <Download className="h-4 w-4 text-slate-400" />
        </button>
      ))}
    </div>
  );
}

function DiscussionPanel() {
  return (
    <div className="space-y-3">
      {["Sinh viên cần ví dụ bổ sung cho phần hoạt động nhóm.", "Đề xuất thêm câu hỏi kiểm tra nhanh cuối video."].map((item) => (
        <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
          <p className="mt-1 text-xs text-slate-500">Phản hồi lớp WEB101 - 2 giờ trước</p>
        </div>
      ))}
    </div>
  );
}

function NotesPanel() {
  return (
    <textarea
      rows={6}
      placeholder="Ghi chú nhanh cho lần giảng tiếp theo..."
      className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
    />
  );
}
