import React, { useState } from "react";
import { useAiSeoUiStore } from "../../stores/useAiSeoUiStore";
import { useSeoProjectsQuery, useStartAuditMutation } from "../../hooks/useSeoProjectQueries";
import {
  useSeoTasksQuery,
  useUpdateSeoTaskMutation,
  useApproveSeoTaskMutation,
  useRejectSeoTaskMutation,
  useDeploySeoTaskMutation
} from "../../hooks/useSeoTaskQueries";
import { useJobPolling } from "../../hooks/useJobPolling";
import { Play, Loader2, Sparkles, Terminal, HelpCircle } from "lucide-react";
import TaskCard from "./TaskCard";
import TaskDetailDrawer from "./TaskDetailDrawer";

export function TaskBoard() {
  const { selectedOrgId, selectedProjectId, selectedSeoProjectId, activeJobId } = useAiSeoUiStore();

  const { data: seoProjects = [] } = useSeoProjectsQuery(selectedOrgId);
  const { data: tasks = [], isLoading: isLoadingTasks } = useSeoTasksQuery(selectedOrgId, selectedSeoProjectId);

  const startAuditMutation = useStartAuditMutation(selectedOrgId);
  const updateStatusMutation = useUpdateSeoTaskMutation(selectedOrgId, selectedSeoProjectId);
  const approveMutation = useApproveSeoTaskMutation(selectedOrgId, selectedSeoProjectId);
  const rejectMutation = useRejectSeoTaskMutation(selectedOrgId, selectedSeoProjectId);
  const deployMutation = useDeploySeoTaskMutation(selectedOrgId, selectedSeoProjectId);

  // Poll job status if a background job is active
  const { job, events } = useJobPolling(selectedOrgId, activeJobId, selectedSeoProjectId);

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const activeSeoProj = seoProjects.find((sp) => sp.id === selectedSeoProjectId);

  const handleStartAudit = async () => {
    if (selectedSeoProjectId) {
      await startAuditMutation.mutateAsync(selectedSeoProjectId);
    }
  };

  const handleUpdateStatus = (id: string, status: 'todo' | 'in_progress' | 'completed') => {
    updateStatusMutation.mutate({ id, status });
  };

  const latestEventMessage =
    events.length > 0
      ? String(events[events.length - 1]?.message ?? "Đang chuẩn bị quét...")
      : "Đang chuẩn bị quét...";

  // Separate tasks into columns
  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const columns = [
    { id: "todo", title: "Cần xử lý", tasks: todoTasks, color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400 border-gray-200 dark:border-gray-800" },
    { id: "in_progress", title: "Đang xử lý", tasks: inProgressTasks, color: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-150/15" },
    { id: "completed", title: "Đã hoàn thành", tasks: completedTasks, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-150/15" }
  ];

  if (!selectedProjectId) {
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-650 bg-white dark:bg-[#1a1a26] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
        <p className="text-sm font-semibold">Chọn hoặc tạo một dự án để bắt đầu quản lý đề xuất.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header & Audit Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Dự án SEO đang quét
          </span>
          <h3 className="text-base font-extrabold text-gray-850 dark:text-white mt-0.5">
            {activeSeoProj ? activeSeoProj.domain : "Chưa cấu hình tên miền"}
          </h3>
        </div>

        {activeSeoProj && (
          <div>
            {job ? (
              <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/10 rounded-xl px-4 py-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <div className="min-w-0">
                  <span className="font-bold">Crawl Audit đang chạy...</span>
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate max-w-[200px]">
                    {latestEventMessage}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartAudit}
                disabled={startAuditMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition disabled:bg-blue-600/50 disabled:cursor-not-allowed"
              >
                {startAuditMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang thiết lập...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Chạy Audit Kỹ Thuật
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex flex-col bg-gray-50/40 dark:bg-[#151522] border border-gray-250 dark:border-gray-850/60 rounded-2xl p-4 min-h-[400px] h-fit"
          >
            {/* Column Title */}
            <div className={`flex items-center justify-between border px-3 py-1.5 rounded-xl mb-4 ${col.color}`}>
              <span className="text-xs font-bold">{col.title}</span>
              <span className="text-xs font-bold opacity-80">{col.tasks.length}</span>
            </div>

            {/* Tasks list */}
            {isLoadingTasks ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-28 bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : col.tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12 text-center text-gray-400 dark:text-gray-650 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <span className="text-xs">Không có đề xuất</span>
              </div>
            ) : (
              <div className="space-y-4">
                {col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdateStatus={handleUpdateStatus}
                    onInspect={setSelectedTask}
                    onDeploy={(id) => deployMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Task Detail Inspect Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id) => rejectMutation.mutate(id)}
        onDeploy={(id) => deployMutation.mutate(id)}
      />
    </div>
  );
}
export default TaskBoard;
