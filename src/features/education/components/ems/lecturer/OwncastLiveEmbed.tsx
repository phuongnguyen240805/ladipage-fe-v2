"use client";

import Link from "next/link";
import { MessageSquareText, Radio, Settings, Video } from "lucide-react";

type OwncastLiveEmbedProps = {
  title?: string;
  description?: string;
  chatMode?: "readwrite" | "readonly";
  compact?: boolean;
};

const owncastBaseUrl = (process.env.NEXT_PUBLIC_OWNCAST_URL || "").replace(/\/$/, "");

export default function OwncastLiveEmbed({
  title = "Livestream bài giảng",
  description = "Phát trực tiếp video và chat lớp học bằng Owncast tự host.",
  chatMode = "readwrite",
  compact = false,
}: OwncastLiveEmbedProps) {
  const videoUrl = owncastBaseUrl ? `${owncastBaseUrl}/embed/video?initiallyMuted=true` : "";
  const chatUrl = owncastBaseUrl ? `${owncastBaseUrl}/embed/chat/${chatMode}` : "";

  if (!owncastBaseUrl) {
    return (
      <section className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-slate-900">
            <Settings className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Chưa cấu hình Owncast</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Thêm `NEXT_PUBLIC_OWNCAST_URL=https://live.ten-truong.edu.vn` vào file môi trường để bật livestream và chat riêng.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
            <Radio className="h-3.5 w-3.5" />
            Live
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Link
          href={owncastBaseUrl}
          target="_blank"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Mở Owncast
        </Link>
      </div>

      <div className={`grid grid-cols-1 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_340px]"}`}>
        <div className="bg-black">
          <div className="aspect-video">
            <iframe
              src={videoUrl}
              title="Owncast livestream"
              referrerPolicy="origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>

        {!compact && (
          <div className="border-t border-slate-200 dark:border-slate-800 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <MessageSquareText className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Chat lớp học</h4>
            </div>
            <iframe
              src={chatUrl}
              title="Owncast chat"
              referrerPolicy="origin"
              className="h-[420px] w-full bg-white dark:bg-slate-950"
            />
          </div>
        )}
      </div>
    </section>
  );
}
