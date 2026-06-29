import React from "react";
import { SeoTask } from "../../types";
import { AlertTriangle, ArrowRight, CheckCircle2, Play, Eye } from "lucide-react";

interface TaskCardProps {
  task: SeoTask;
  onUpdateStatus: (id: string, status: 'todo' | 'in_progress' | 'completed') => void;
  onInspect: (task: SeoTask) => void;
  onDeploy: (id: string) => void;
}

export function TaskCard({ task, onUpdateStatus, onInspect, onDeploy }: TaskCardProps) {
  const isTodo = task.status === "todo";
  const isInProgress = task.status === "in_progress";
  const isCompleted = task.status === "completed";

  const importanceColors = {
    high: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
    medium: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    low: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
  };

  return (
    <div className="bg-white dark:bg-[#1e1e2d] border border-gray-250 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow transition space-y-3.5 group">
      {/* Header tags */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${importanceColors[task.importance]}`}>
          {task.importance} Importance
        </span>
        <button
          onClick={() => onInspect(task)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          title="Xem chi tiết"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h5 className="text-xs font-bold text-gray-850 dark:text-white leading-normal">
          {task.title}
        </h5>
        {task.description && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer controls */}
      <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between gap-2">
        {/* Quick Deploy button for high/medium items in progress */}
        {isInProgress ? (
          <button
            onClick={() => onDeploy(task.id)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:bg-blue-100 dark:hover:bg-blue-950/60 transition border border-blue-150/15"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            Tự động sửa
          </button>
        ) : (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
            {new Date(task.updated_at).toLocaleDateString([], { month: "2-digit", day: "2-digit" })}
          </span>
        )}

        {/* Quick status transition links */}
        <div className="flex gap-1.5 shrink-0">
          {isTodo && (
            <button
              onClick={() => onUpdateStatus(task.id, "in_progress")}
              className="text-[9px] font-bold text-gray-500 hover:text-blue-500 flex items-center gap-0.5 border border-gray-200 dark:border-gray-800 rounded px-1.5 py-0.5 bg-gray-50/50 dark:bg-gray-900/30 transition"
              title="Bắt đầu xử lý"
            >
              Làm việc
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
          {isInProgress && (
            <button
              onClick={() => onUpdateStatus(task.id, "completed")}
              className="text-[9px] font-bold text-gray-500 hover:text-emerald-500 flex items-center gap-0.5 border border-gray-200 dark:border-gray-800 rounded px-1.5 py-0.5 bg-gray-50/50 dark:bg-gray-900/30 transition"
              title="Đánh dấu hoàn thành"
            >
              Xong
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
            </button>
          )}
          {isCompleted && (
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/10" />
              Đã xử lý
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
export default TaskCard;
