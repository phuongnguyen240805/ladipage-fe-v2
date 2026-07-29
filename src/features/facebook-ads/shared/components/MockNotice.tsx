import { FlaskConical } from "lucide-react";

export default function MockNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex gap-2 rounded-xl border border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-200 ${
        compact ? "px-3 py-2" : "p-4"
      }`}
    >
      <FlaskConical size={16} className="mt-0.5 shrink-0" />
      <p className="text-[11px] leading-4">
        Đây là dữ liệu mô phỏng để duyệt UI/UX. Các thao tác chưa gửi đến Meta hoặc tiêu tốn ngân sách.
      </p>
    </div>
  );
}

