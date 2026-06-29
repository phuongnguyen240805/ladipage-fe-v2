import React from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";

export function EmptySeoProjectState() {
  return (
    <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl p-8 max-w-md mx-auto my-10 space-y-4">
      <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800">Không tìm thấy dự án nào</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
          Không tìm thấy dự án phù hợp với bộ lọc tìm kiếm của bạn. Hãy đổi từ khóa hoặc tạo dự án mới.
        </p>
      </div>
      <Link
        href="/ai-seo/projects/create"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Tạo dự án mới
      </Link>
    </div>
  );
}
export default EmptySeoProjectState;
