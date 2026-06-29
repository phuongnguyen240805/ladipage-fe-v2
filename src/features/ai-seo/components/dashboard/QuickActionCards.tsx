import React from "react";
import Link from "next/link";
import { Sparkles, FileText, Search, PlusCircle, LayoutGrid } from "lucide-react";
import { useAiSeoUiStore } from "../../stores/useAiSeoUiStore";

export function QuickActionCards() {
  const selectedProjectId = useAiSeoUiStore((state) => state.selectedProjectId);

  const actions = [
    {
      title: "Chạy Kỹ Thuật Audit",
      description: "Quét sitemap và phát hiện lỗi crawl.",
      href: selectedProjectId ? `/ai-seo/projects/${selectedProjectId}/tasks?action=audit` : "/ai-seo/projects",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/20"
    },
    {
      title: "Viết Bài Chuẩn SEO",
      description: "Soạn thảo bài viết tối ưu từ khóa phụ.",
      href: "/content",
      icon: FileText,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/20"
    },
    {
      title: "Nghiên Cứu Từ Khóa",
      description: "Phân tích Search Volume và Độ khó từ khóa.",
      href: "/keywords",
      icon: Search,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-900/20"
    },
    {
      title: "Tạo Dự Án SEO Mới",
      description: "Thiết lập cấu hình domain và crawl bot.",
      href: "/ai-seo/projects/create",
      icon: PlusCircle,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/20"
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 px-1">
        <LayoutGrid className="w-3.5 h-3.5" />
        Thao tác nhanh (Quick Actions)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((act, idx) => (
          <Link
            key={idx}
            href={act.href}
            className="flex flex-col text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e2d] hover:shadow transition group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mb-3 transition ${act.color}`}>
              <act.icon className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {act.title}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 leading-normal">
              {act.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default QuickActionCards;
