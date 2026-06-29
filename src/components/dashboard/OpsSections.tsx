import { localeName, type UiLanguage } from "../../i18n";
import type { Agent, Task } from "../../types";
import AgentAvatar from "../AgentAvatar";
import { getRankTier, STATUS_LABELS, STATUS_LEFT_BORDER, taskStatusLabel, timeAgo, type TFunction } from "./model";

export interface DepartmentPerformance {
  id: string;
  name: string;
  icon: string;
  done: number;
  total: number;
  ratio: number;
  color: {
    bar: string;
    badge: string;
  };
}

interface DashboardDeptAndSquadProps {
  deptData: DepartmentPerformance[];
  workingAgents: Agent[];
  idleAgentsList: Agent[];
  agents: Agent[];
  language: UiLanguage;
  numberFormatter: Intl.NumberFormat;
  t: TFunction;
}

export function DashboardDeptAndSquad({
  deptData,
  workingAgents,
  idleAgentsList,
  agents,
  language,
  numberFormatter,
  t,
}: DashboardDeptAndSquadProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div className="game-panel p-5">
        <h2
          className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider"
          style={{ color: "var(--th-text-primary)" }}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-sm"
            style={{ boxShadow: "0 0 8px rgba(59,130,246,0.3)" }}
          >
            🏰
          </span>
          {t({ ko: "부서 성과", en: "DEPT. PERFORMANCE", ja: "部署パフォーマンス", zh: "部门绩效" })}
          <span
            className="ml-auto text-[9px] font-medium normal-case tracking-normal"
            style={{ color: "var(--th-text-muted)" }}
          >
            {t({ ko: "부서별 성과", en: "by department", ja: "部署別", zh: "按部门" })}
          </span>
        </h2>

        {deptData.length === 0 ? (
          <div
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-sm"
            style={{ color: "var(--th-text-muted)" }}
          >
            <span className="text-3xl opacity-30">🏰</span>
            {t({ ko: "데이터가 없습니다", en: "No data available", ja: "データがありません", zh: "暂无数据" })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {deptData.map((dept) => (
              <article
                key={dept.id}
                className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:translate-x-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-transform duration-200 group-hover:scale-110"
                      style={{ background: "var(--th-bg-surface)" }}
                    >
                      {dept.icon}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--th-text-primary)" }}>
                      {dept.name}
                    </span>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black ${dept.color.badge}`}>
                    {dept.ratio}%
                  </span>
                </div>

                <div className="mt-2.5 relative h-2 overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.04]">
                  <div
                    className={`xp-bar-fill h-full rounded-full bg-gradient-to-r ${dept.color.bar} transition-all duration-700`}
                    style={{ width: `${dept.ratio}%` }}
                  />
                </div>

                <div
                  className="mt-1.5 flex justify-between text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--th-text-muted)" }}
                >
                  <span>
                    {t({ ko: "클리어", en: "cleared", ja: "クリア", zh: "完成" })} {numberFormatter.format(dept.done)}
                  </span>
                  <span>
                    {t({ ko: "전체", en: "total", ja: "全体", zh: "总计" })} {numberFormatter.format(dept.total)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="game-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="flex items-center gap-2 text-sm font-black uppercase tracking-wider"
            style={{ color: "var(--th-text-primary)" }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-sm"
              style={{ boxShadow: "0 0 8px rgba(0,240,255,0.2)" }}
            >
              🤖
            </span>
            {t({ ko: "스쿼드", en: "SQUAD", ja: "スクワッド", zh: "小队" })}
          </h2>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {t({ ko: "ON", en: "ON", ja: "ON", zh: "在线" })} {numberFormatter.format(workingAgents.length)}
            </span>
            <span
              className="flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold"
              style={{
                borderColor: "var(--th-border)",
                background: "var(--th-bg-surface)",
                color: "var(--th-text-secondary)",
              }}
            >
              {t({ ko: "OFF", en: "OFF", ja: "OFF", zh: "离线" })} {numberFormatter.format(idleAgentsList.length)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {agents.map((agent) => {
            const isWorking = agent.status === "working";
            const tier = getRankTier(agent.stats_xp);
            const delay = (agent.id.charCodeAt(0) * 137) % 1500;
            return (
              <div
                key={agent.id}
                title={`${localeName(language, agent)} — ${
                  isWorking
                    ? t({ ko: "작업 중", en: "Working", ja: "作業中", zh: "工作中" })
                    : t({ ko: "대기 중", en: "Idle", ja: "待機中", zh: "空闲" })
                } — ${tier.name}`}
                className={`group relative flex flex-col items-center gap-1.5 ${isWorking ? "animate-bubble-float" : ""}`}
                style={isWorking ? { animationDelay: `${delay}ms` } : {}}
              >
                <div className="relative">
                  <div
                    className="overflow-hidden rounded-2xl transition-transform duration-200 group-hover:scale-110"
                    style={{
                      boxShadow: isWorking ? `0 0 12px ${tier.glow}` : "none",
                      border: isWorking ? `2px solid ${tier.color}60` : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <AgentAvatar agent={agent} agents={agents} size={40} rounded="2xl" />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${
                      isWorking ? "bg-emerald-400 animate-status-glow" : "bg-slate-600"
                    }`}
                    style={{ borderColor: "var(--th-bg-primary)" }}
                  />
                </div>
                <span
                  className="max-w-[52px] truncate text-center text-[9px] font-bold leading-tight"
                  style={{ color: isWorking ? "var(--th-text-primary)" : "var(--th-text-muted)" }}
                >
                  {localeName(language, agent)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface DashboardMissionLogProps {
  recentTasks: Task[];
  agentMap: Map<string, Agent>;
  agents: Agent[];
  language: UiLanguage;
  localeTag: string;
  idleAgents: number;
  numberFormatter: Intl.NumberFormat;
  t: TFunction;
}

export function DashboardMissionLog({
  recentTasks,
  agentMap,
  agents,
  language,
  localeTag,
  idleAgents,
  numberFormatter,
  t,
}: DashboardMissionLogProps) {
  return (
    <div className="game-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-sm font-black uppercase tracking-wider"
          style={{ color: "var(--th-text-primary)" }}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-sm"
            style={{ boxShadow: "0 0 8px rgba(139,92,246,0.2)" }}
          >
            📡
          </span>
          {t({ ko: "미션 로그", en: "MISSION LOG", ja: "ミッションログ", zh: "任务日志" })}
          <span
            className="ml-2 text-[9px] font-medium normal-case tracking-normal"
            style={{ color: "var(--th-text-muted)" }}
          >
            {t({ ko: "최근 활동", en: "Recent activity", ja: "最近の活動", zh: "最近活动" })}
          </span>
        </h2>
        <span
          className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold"
          style={{
            borderColor: "var(--th-border)",
            background: "var(--th-bg-surface)",
            color: "var(--th-text-secondary)",
          }}
        >
          {t({ ko: "유휴", en: "Idle", ja: "待機", zh: "空闲" })} {numberFormatter.format(idleAgents)}
          {t({ ko: "명", en: "", ja: "人", zh: "人" })}
        </span>
      </div>

      {recentTasks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10 text-sm"
          style={{ color: "var(--th-text-muted)" }}
        >
          <span className="text-3xl opacity-30">📡</span>
          {t({ ko: "로그 없음", en: "No logs", ja: "ログなし", zh: "暂无日志" })}
        </div>
      ) : (
        <div className="space-y-2">
          {recentTasks.map((task) => {
            const statusInfo = STATUS_LABELS[task.status] ?? {
              color: "bg-slate-600/20 text-slate-200 border-slate-500/30",
              dot: "bg-slate-400",
            };
            const assignedAgent =
              task.assigned_agent ?? (task.assigned_agent_id ? agentMap.get(task.assigned_agent_id) : undefined);
            const leftBorder = STATUS_LEFT_BORDER[task.status] ?? "border-l-slate-500";

            return (
              <article
                key={task.id}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/[0.06] border-l-[3px] ${leftBorder} bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:translate-x-1`}
              >
                {assignedAgent ? (
                  <AgentAvatar agent={assignedAgent} agents={agents} size={36} rounded="xl" />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl border text-base"
                    style={{
                      borderColor: "var(--th-border)",
                      background: "var(--th-bg-surface)",
                      color: "var(--th-text-muted)",
                    }}
                  >
                    📄
                  </div>
                )}

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-bold transition-colors group-hover:text-white"
                    style={{ color: "var(--th-text-primary)" }}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--th-text-muted)" }}>
                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${statusInfo.dot}`} />
                    {assignedAgent
                      ? localeName(language, assignedAgent)
                      : t({ ko: "미배정", en: "Unassigned", ja: "未割り当て", zh: "未分配" })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusInfo.color}`}
                  >
                    {taskStatusLabel(task.status, t)}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: "var(--th-text-muted)" }}>
                    {timeAgo(task.updated_at, localeTag)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
