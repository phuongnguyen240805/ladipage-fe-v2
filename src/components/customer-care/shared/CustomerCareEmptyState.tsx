import { Inbox } from "lucide-react";

export function CustomerCareEmptyState({
  title = "Chưa có dữ liệu",
  description = "Thử thay đổi bộ lọc hoặc chọn một hội thoại khác.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-full min-h-56 flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-lime-600 dark:bg-lime-500/10 dark:text-lime-400">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
