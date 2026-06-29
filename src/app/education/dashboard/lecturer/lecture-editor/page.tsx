"use client";

import { useState } from "react";
import Link from "next/link";
import OwncastLiveEmbed from "@/features/education/components/ems/lecturer/OwncastLiveEmbed";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Globe2,
  HardDriveUpload,
  LockKeyhole,
  Pencil,
  Play,
  Radio,
  Save,
  Send,
  SlidersHorizontal,
  UploadCloud,
  Video,
} from "lucide-react";

const owncastBaseUrl = (process.env.NEXT_PUBLIC_OWNCAST_URL || "").replace(/\/$/, "");

const upcomingSessions = [
  { label: "Buổi 05", title: "State management nâng cao", date: "12/06/2026", status: "Chờ video" },
  { label: "Buổi 06", title: "Kết nối API và xử lý lỗi", date: "19/06/2026", status: "Đã có slide" },
  { label: "Buổi 07", title: "Triển khai mini project", date: "26/06/2026", status: "Nháp" },
];

const resources = [
  { name: "Slide_buoi_05_State_Management.pptx", meta: "PowerPoint - 12.4 MB", status: "Có thể chỉnh sửa" },
  { name: "Ke_hoach_bai_giang_buoi_05.pdf", meta: "PDF - 2.1 MB", status: "Đã đồng bộ" },
  { name: "Bai_tap_thuc_hanh_hooks.docx", meta: "Word - 680 KB", status: "Nháp" },
];

export default function LecturerLectureEditorPage() {
  const [visibility, setVisibility] = useState<"public" | "private" | "scheduled">("scheduled");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-600">Quản lý bài giảng</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Tải lên & chỉnh sửa bài giảng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cập nhật video, slide và lịch phát cho các buổi học hiện tại hoặc buổi sắp tới.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/30">
            <Save className="h-4 w-4" />
            Lưu nháp
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">
            <Send className="h-4 w-4" />
            Xuất bản bài giảng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-6">
          <UploadPanel />
          <OwncastSetupPanel />
          <MetadataPanel />
          <ResourceEditorPanel />
          <UpcomingSessionsPanel />
        </section>

        <aside className="space-y-6">
          <PreviewPanel />
          <VisibilityPanel visibility={visibility} onChange={setVisibility} />
          <PublishChecklist />
        </aside>
      </div>
    </div>
  );
}

function UploadPanel() {
  return (
    <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-emerald-950/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        <Video className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Kéo thả video bài giảng</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Hỗ trợ MP4, MOV, AVI. Video ở chế độ riêng tư cho tới khi giảng viên xuất bản hoặc lên lịch phát.
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700">
          <HardDriveUpload className="h-4 w-4" />
          Chọn tệp từ máy tính
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
          <UploadCloud className="h-4 w-4" />
          Thay video hiện tại
        </button>
      </div>

      <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-emerald-100 bg-white p-4 text-left shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">lecture_state_management_05.mp4</p>
            <p className="mt-1 text-xs text-slate-500">Đang xử lý phụ đề và chất lượng video</p>
          </div>
          <span className="text-sm font-black text-emerald-700">78%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-[78%] rounded-full bg-emerald-600" />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">Còn khoảng 2 phút</p>
      </div>
    </section>
  );
}

function OwncastSetupPanel() {
  const ingestUrl = owncastBaseUrl ? `${owncastBaseUrl.replace(/^https?:\/\//, "rtmp://")}/live` : "rtmp://live.ten-truong.edu.vn/live";

  return (
    <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
      <div>
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Owncast livestream riêng</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Dùng Owncast để phát trực tiếp buổi học và chat riêng trong hệ thống, không phụ thuộc Twitch hoặc YouTube Live.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Owncast server">
            <input
              readOnly
              value={owncastBaseUrl || "Chưa cấu hình NEXT_PUBLIC_OWNCAST_URL"}
              className={`${inputClassName} bg-slate-50 text-slate-500 dark:bg-slate-950`}
            />
          </Field>
          <Field label="RTMP ingest URL cho OBS">
            <input readOnly value={ingestUrl} className={`${inputClassName} bg-slate-50 font-mono text-xs text-slate-600 dark:bg-slate-950`} />
          </Field>
          <Field label="Stream key">
            <input readOnly value="••••••••••••••••" className={`${inputClassName} bg-slate-50 font-mono text-slate-600 dark:bg-slate-950`} />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={owncastBaseUrl || "#"}
            target={owncastBaseUrl ? "_blank" : undefined}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <Radio className="h-4 w-4" />
            Mở phòng live
          </Link>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
            <CalendarClock className="h-4 w-4" />
            Gắn vào buổi sau
          </button>
        </div>
      </div>

      <OwncastLiveEmbed
        compact
        chatMode="readonly"
        title="Preview livestream"
        description="Khung xem trước nguồn live từ Owncast."
      />
    </section>
  );
}

function MetadataPanel() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
        <Pencil className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chỉnh sửa thông tin bài giảng</h2>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label="Tiêu đề bài giảng" required>
          <input defaultValue="Buổi 05: State management nâng cao" className={inputClassName} />
        </Field>
        <Field label="Mã buổi học">
          <input defaultValue="WEB101-B05" className={inputClassName} />
        </Field>
        <Field label="Chọn học phần">
          <SelectBox value="CNW202 - Công nghệ Web nâng cao" />
        </Field>
        <Field label="Chương / Module">
          <SelectBox value="Chương 02: React & Hooks" />
        </Field>
        <Field label="Gắn với lịch giảng">
          <SelectBox value="Thứ Sáu, 12/06/2026 - Tiết 3-5" />
        </Field>
        <Field label="Trạng thái nội dung">
          <SelectBox value="Bản nháp - chờ xuất bản" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Mô tả chi tiết">
            <textarea
              rows={4}
              defaultValue="Buổi học hướng dẫn sinh viên quản lý state, tách logic bằng custom hook và chuẩn bị cho phần kết nối API ở buổi sau."
              className={`${inputClassName} resize-none leading-6`}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function ResourceEditorPanel() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Slide & tài liệu kèm theo</h2>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">
          <UploadCloud className="h-4 w-4" />
          Tải tài liệu
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {resources.map((resource) => (
          <div key={resource.name} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{resource.name}</p>
              <p className="mt-1 text-xs text-slate-500">{resource.meta}</p>
            </div>
            <span className="w-fit rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm dark:bg-slate-900">
              {resource.status}
            </span>
            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
              <Pencil className="h-4 w-4" />
              Sửa
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function UpcomingSessionsPanel() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
        <CalendarClock className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chuẩn bị bài giảng buổi sau</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {upcomingSessions.map((session) => (
          <button
            key={session.label}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40"
          >
            <p className="text-xs font-bold uppercase text-emerald-600">{session.label}</p>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-slate-900 dark:text-white">{session.title}</p>
            <p className="mt-2 text-xs text-slate-500">{session.date}</p>
            <span className="mt-3 inline-flex rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm dark:bg-slate-900">
              {session.status}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PreviewPanel() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
      <div className="relative aspect-video bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(16,185,129,0.35),transparent_34%),linear-gradient(135deg,#0f172a,#111827)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition hover:scale-105">
            <Play className="h-8 w-8 fill-current" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <Play className="h-4 w-4 fill-current" />
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-1/3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[11px] font-mono">12:45 / 45:00</span>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Xem trước bài giảng</h3>
          <p className="mt-1 text-xs text-slate-500">Kiểm tra video, slide và phụ đề trước khi xuất bản.</p>
        </div>
        <Eye className="h-5 w-5 text-slate-400" />
      </div>
    </section>
  );
}

function VisibilityPanel({ visibility, onChange }: { visibility: string; onChange: (value: "public" | "private" | "scheduled") => void }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Chế độ hiển thị</h3>
      </div>
      <div className="mt-4 space-y-3">
        <VisibilityOption icon={Globe2} value="public" title="Công khai" description="Sinh viên trong học phần xem được ngay" active={visibility === "public"} onClick={onChange} />
        <VisibilityOption icon={LockKeyhole} value="private" title="Riêng tư" description="Chỉ giảng viên xem được bản nháp" active={visibility === "private"} onClick={onChange} />
        <VisibilityOption icon={Clock3} value="scheduled" title="Lên lịch phát" description="Tự động mở theo lịch giảng dạy" active={visibility === "scheduled"} onClick={onChange} />
      </div>

      {visibility === "scheduled" && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <Field label="Ngày phát hành">
            <input type="date" defaultValue="2026-06-12" className={inputClassName} />
          </Field>
          <Field label="Giờ bắt đầu">
            <input type="time" defaultValue="08:00" className={inputClassName} />
          </Field>
        </div>
      )}
    </section>
  );
}

function PublishChecklist() {
  const items = ["Video đã tải lên", "Slide đã gắn", "Mô tả đã cập nhật", "Lịch phát đã chọn"];
  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">Sẵn sàng xuất bản</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {item}
          </div>
        ))}
      </div>
      <Link href="/education/dashboard/lecturer/lectures" className="mt-5 flex h-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 dark:bg-slate-900 dark:hover:bg-slate-800">
        Xem trong kho bài giảng
      </Link>
    </section>
  );
}

function VisibilityOption({
  icon: Icon,
  value,
  title,
  description,
  active,
  onClick,
}: {
  icon: any;
  value: "public" | "private" | "scheduled";
  title: string;
  description: string;
  active: boolean;
  onClick: (value: "public" | "private" | "scheduled") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-900 dark:text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
    </button>
  );
}

function SelectBox({ value }: { value: string }) {
  return (
    <div className="relative">
      <select defaultValue={value} className={`${inputClassName} appearance-none pr-10`}>
        <option>{value}</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100";
