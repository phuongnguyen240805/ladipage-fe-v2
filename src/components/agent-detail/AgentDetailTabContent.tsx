import { assetUrl } from "@/lib/cdn";
import { localeName, type UiLanguage } from "../../i18n";
import type { Agent, Department, SubAgent, SubTask, Task } from "../../types";
import { getSubAgentSpriteNum, SUBTASK_STATUS_ICON, taskStatusLabel, taskTypeLabel, type TFunction } from "./constants";

interface AgentDetailTabContentProps {
  tab: "info" | "tasks" | "alba";
  t: TFunction;
  language: UiLanguage;
  agent: Agent;
  departments: Department[];
  agentTasks: Task[];
  agentSubAgents: SubAgent[];
  subtasksByTask: Record<string, SubTask[]>;
  expandedTaskId: string | null;
  setExpandedTaskId: (taskId: string | null) => void;
  onChat: (agent: Agent) => void;
  onAssignTask: (agentId: string) => void;
  onOpenTerminal?: (taskId: string) => void;
}

export default function AgentDetailTabContent({
  tab,
  t,
  language,
  agent,
  departments,
  agentTasks,
  agentSubAgents,
  subtasksByTask,
  expandedTaskId,
  setExpandedTaskId,
  onChat,
  onAssignTask,
  onOpenTerminal,
}: AgentDetailTabContentProps) {
  const xpLevel = Math.floor(agent.stats_xp / 100) + 1;

  if (tab === "info") {
    return (
      <div className="space-y-3">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">
            {t({ ko: "성격", en: "Personality", ja: "性格", zh: "性格" })}
          </div>
          <div className="text-sm text-slate-300">
            {agent.personality ?? t({ ko: "설정 없음", en: "Not set", ja: "未設定", zh: "未设置" })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{agent.stats_tasks_done}</div>
            <div className="text-[10px] text-slate-500">
              {t({ ko: "완료 업무", en: "Completed", ja: "完了タスク", zh: "已完成任务" })}
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{xpLevel}</div>
            <div className="text-[10px] text-slate-500">{t({ ko: "레벨", en: "Level", ja: "レベル", zh: "等级" })}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {agentSubAgents.filter((subAgent) => subAgent.status === "working").length}
            </div>
            <div className="text-[10px] text-slate-500">
              {t({ ko: "알바생", en: "Sub-agents", ja: "サブエージェント", zh: "子代理" })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onChat(agent)}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            💬 {t({ ko: "대화하기", en: "Chat", ja: "チャット", zh: "对话" })}
          </button>
          <button
            onClick={() => onAssignTask(agent.id)}
            className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            📋 {t({ ko: "업무 배정", en: "Assign Task", ja: "タスク割り当て", zh: "分配任务" })}
          </button>
        </div>
        {agent.status === "working" && agent.current_task_id && onOpenTerminal && (
          <button
            onClick={() => onOpenTerminal(agent.current_task_id!)}
            className="w-full mt-2 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            &#128421; {t({ ko: "터미널 보기", en: "View Terminal", ja: "ターミナル表示", zh: "查看终端" })}
          </button>
        )}
      </div>
    );
  }

  if (tab === "tasks") {
    return (
      <div className="space-y-2">
        {agentTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {t({
              ko: "배정된 업무가 없습니다",
              en: "No assigned tasks",
              ja: "割り当てられたタスクはありません",
              zh: "暂无已分配任务",
            })}
          </div>
        ) : (
          agentTasks.map((taskItem) => {
            const taskSubtasks = subtasksByTask[taskItem.id] ?? [];
            const isExpanded = expandedTaskId === taskItem.id;
            const subTotal = taskItem.subtask_total ?? taskSubtasks.length;
            const subDone = taskItem.subtask_done ?? taskSubtasks.filter((subtask) => subtask.status === "done").length;
            return (
              <div key={taskItem.id} className="bg-slate-700/30 rounded-lg p-3">
                <button
                  onClick={() => setExpandedTaskId(isExpanded ? null : taskItem.id)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      taskItem.status === "done"
                        ? "bg-green-500"
                        : taskItem.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-slate-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{taskItem.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {taskStatusLabel(taskItem.status, t)} · {taskTypeLabel(taskItem.task_type, t)}
                    </div>
                    {subTotal > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${Math.round((subDone / subTotal) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {subDone}/{subTotal}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                {isExpanded && taskSubtasks.length > 0 && (
                  <div className="mt-2 ml-5 space-y-1 border-l border-slate-600 pl-2">
                    {taskSubtasks.map((subtask) => {
                      const targetDepartment = subtask.target_department_id
                        ? departments.find((department) => department.id === subtask.target_department_id)
                        : null;
                      return (
                        <div key={subtask.id} className="flex items-center gap-1.5 text-xs">
                          <span>{SUBTASK_STATUS_ICON[subtask.status] || "\u23F3"}</span>
                          <span
                            className={`flex-1 truncate ${subtask.status === "done" ? "line-through text-slate-500" : "text-slate-300"}`}
                          >
                            {subtask.title}
                          </span>
                          {targetDepartment && (
                            <span
                              className="shrink-0 rounded px-1 py-0.5 text-[10px] font-medium"
                              style={{ backgroundColor: targetDepartment.color + "30", color: targetDepartment.color }}
                            >
                              {targetDepartment.icon} {localeName(language, targetDepartment)}
                            </span>
                          )}
                          {subtask.delegated_task_id && subtask.status !== "done" && (
                            <span
                              className="text-blue-400 shrink-0"
                              title={t({ ko: "위임됨", en: "Delegated", ja: "委任済み", zh: "已委派" })}
                            >
                              🔗
                            </span>
                          )}
                          {subtask.status === "blocked" && subtask.blocked_reason && (
                            <span
                              className="text-red-400 text-[10px] truncate max-w-[80px]"
                              title={subtask.blocked_reason}
                            >
                              {subtask.blocked_reason}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {agentSubAgents.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          <div className="text-3xl mb-2">🧑‍💼</div>
          {t({
            ko: "현재 알바생이 없습니다",
            en: "No sub-agents currently",
            ja: "現在サブエージェントはいません",
            zh: "当前没有子代理",
          })}
          <div className="text-xs mt-1 text-slate-600">
            {t({
              ko: "병렬 처리 시 자동으로 알바생이 소환됩니다",
              en: "Sub-agents are spawned automatically during parallel work.",
              ja: "並列処理時にサブエージェントが自動で生成されます。",
              zh: "并行处理时会自动生成子代理。",
            })}
          </div>
        </div>
      ) : (
        agentSubAgents.map((subAgent) => (
          <div
            key={subAgent.id}
            className={`bg-slate-700/30 rounded-lg p-3 flex items-center gap-3 ${subAgent.status === "working" ? "animate-alba-spawn" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 overflow-hidden flex items-center justify-center">
              <img
                src={assetUrl(`/sprites/${getSubAgentSpriteNum(subAgent.id)}-D-1.png`)}
                alt={t({ ko: "알바생", en: "Sub-agent", ja: "サブエージェント", zh: "子代理" })}
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate flex items-center gap-1.5">
                <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  {t({ ko: "알바", en: "Sub", ja: "サブ", zh: "子任务" })}
                </span>
                {subAgent.task}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {subAgent.status === "working"
                  ? `🔨 ${t({ ko: "작업중...", en: "Working...", ja: "作業中...", zh: "工作中..." })}`
                  : `✅ ${t({ ko: "완료", en: "Done", ja: "完了", zh: "完成" })}`}
              </div>
            </div>
            {subAgent.status === "working" && (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        ))
      )}
    </div>
  );
}
