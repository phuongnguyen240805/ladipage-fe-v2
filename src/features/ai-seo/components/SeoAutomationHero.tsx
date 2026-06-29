import React from "react";
import Link from "next/link";
import { Play, Plus } from "lucide-react";

interface SeoAutomationHeroProps {
  onCreateClick?: () => void;
}

export function SeoAutomationHero({ onCreateClick }: SeoAutomationHeroProps) {
  return (
    <div className="bg-gradient-to-r from-lime-50/50 to-emerald-50/30 dark:from-slate-900/60 dark:to-emerald-950/10 pt-10 pb-20 px-8 text-left border-b border-gray-200/60 dark:border-gray-800 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3.5 max-w-3xl">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
              Tối ưu hóa SEO tự động
            </h1>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white rounded-lg text-xs font-semibold shadow-xs transition select-none cursor-pointer">
              <Play className="w-3 h-3 fill-current" />
              Cách hoạt động
            </button>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Triển khai hàng ngàn tối ưu hóa on-page và sửa lỗi kỹ thuật chỉ trong vài cú nhấp chuột bằng AI SEO Agent. 
            Tự động thực hiện các thay đổi trực tiếp trên website của bạn mà không cần rời khỏi dashboard quản trị. 
            Loại bỏ hoàn toàn các công việc SEO thủ công bằng công nghệ AI.
          </p>
        </div>

        {/* Create Button */}
        <Link
          href="/ai-seo/projects/create"
          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-lime-500 hover:bg-lime-600 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0 select-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Tạo mới
        </Link>
      </div>
    </div>
  );
}
export default SeoAutomationHero;
