import AgentAvatar from "../AgentAvatar";
import type { Agent } from "../../types";
import { getRankTier, RankBadge, XpBar, type TFunction } from "./model";

export interface HudStat {
  id: string;
  label: string;
  value: number | string;
  sub: string;
  color: string;
  icon: string;
}

export interface RankedAgent {
  id: string;
  name: string;
  department: string;
  tasksDone: number;
  xp: number;
}

interface DashboardHeroHeaderProps {
  companyName: string;
  time: string;
  date: string;
  briefing: string;
  reviewQueue: number;
  numberFormatter: Intl.NumberFormat;
  primaryCtaEyebrow: string;
  primaryCtaDescription: string;
  primaryCtaLabel: string;
  onPrimaryCtaClick: () => void;
  t: TFunction;
}

export function DashboardHeroHeader({
  companyName,
  time,
  date,
  briefing,
  reviewQueue,
  numberFormatter,
  primaryCtaEyebrow,
  primaryCtaDescription,
  primaryCtaLabel,
  onPrimaryCtaClick,
  t,
}: DashboardHeroHeaderProps) {
  return (
    <div className="game-panel relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="dashboard-title-gradient text-2xl font-black tracking-tight sm:text-3xl">{companyName}</h1>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {t({ ko: "실시간", en: "LIVE", ja: "ライブ", zh: "实时" })}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--th-text-muted)" }}>
            {t({
              ko: "에이전트들이 실시간으로 미션을 수행 중입니다",
              en: "Agents are executing missions in real time",
              ja: "エージェントがリアルタイムでミッションを実行中です",
              zh: "代理正在实时执行任务",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.06] px-4 py-2">
            <span className="text-xs text-cyan-400/60">⏰</span>
            <span className="dashboard-time-display font-mono text-xl font-bold tracking-tight">{time}</span>
          </div>
          <div className="hidden flex-col gap-1 sm:flex">
            <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-400">
              {date}
            </span>
            <span className="rounded-md border border-cyan-400/20 bg-cyan-500/[0.06] px-2 py-0.5 text-[10px] text-cyan-300">
              {briefing}
            </span>
          </div>
          {reviewQueue > 0 && (
            <span className="flex items-center gap-1.5 rounded-lg border border-orange-400/30 bg-orange-500/15 px-3 py-1.5 text-xs font-bold text-orange-300 animate-neon-pulse-orange">
              🔔 {t({ ko: "대기", en: "Queued", ja: "待機", zh: "待处理" })} {numberFormatter.format(reviewQueue)}
              {t({ ko: "건", en: "", ja: "件", zh: "项" })}
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-4 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-emerald-500/20 p-4 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/85">{primaryCtaEyebrow}</p>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--th-text-primary)" }}>
              {primaryCtaDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onPrimaryCtaClick}
            className="animate-cta-glow group inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-black tracking-tight text-white shadow-[0_4px_20px_rgba(34,211,238,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-400 hover:shadow-[0_8px_30px_rgba(34,211,238,0.5)] active:translate-y-0 sm:w-auto sm:min-w-[200px]"
          >
            <span aria-hidden="true">🚀</span>
            <span>{primaryCtaLabel}</span>
            <span
              className="text-xs text-white/80 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface DashboardHudStatsProps {
  hudStats: HudStat[];
  numberFormatter: Intl.NumberFormat;
}

export function DashboardHudStats({ hudStats, numberFormatter }: DashboardHudStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {hudStats.map((stat) => (
        <div
          key={stat.id}
          className="game-panel group relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5"
          style={{ borderColor: `${stat.color}25` }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
            style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--th-text-muted)" }}>
                {stat.label}
              </p>
              <p
                className="mt-1 text-3xl font-black tracking-tight"
                style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}
              >
                {typeof stat.value === "number" ? numberFormatter.format(stat.value) : stat.value}
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: "var(--th-text-muted)" }}>
                {stat.sub}
              </p>
            </div>
            <span
              className="text-3xl opacity-20 transition-all duration-300 group-hover:opacity-40 group-hover:scale-110"
              style={{ filter: `drop-shadow(0 0 8px ${stat.color}40)` }}
            >
              {stat.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface DashboardRankingBoardProps {
  topAgents: RankedAgent[];
  podiumOrder: RankedAgent[];
  agentMap: Map<string, Agent>;
  agents: Agent[];
  maxXp: number;
  numberFormatter: Intl.NumberFormat;
  t: TFunction;
}

export function DashboardRankingBoard({
  topAgents,
  podiumOrder,
  agentMap,
  agents,
  maxXp,
  numberFormatter,
  t,
}: DashboardRankingBoardProps) {
  return (
    <div className="game-panel relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-transparent to-transparent" />

      <div className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-2xl animate-crown-wiggle"
            style={{ display: "inline-block", filter: "drop-shadow(0 0 8px rgba(255,215,0,0.5))" }}
          >
            🏆
          </span>
          <div>
            <h2 className="dashboard-ranking-gradient text-lg font-black uppercase tracking-wider">
              {t({ ko: "랭킹 보드", en: "RANKING BOARD", ja: "ランキングボード", zh: "排行榜" })}
            </h2>
            <p className="text-[10px]" style={{ color: "var(--th-text-muted)" }}>
              {t({
                ko: "XP 기준 에이전트 순위",
                en: "Agent ranking by XP",
                ja: "XP 基準のエージェント順位",
                zh: "按 XP 排名",
              })}
            </p>
          </div>
        </div>
        <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-slate-400">
          TOP {topAgents.length}
        </span>
      </div>

      {topAgents.length === 0 ? (
        <div
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-sm"
          style={{ color: "var(--th-text-muted)" }}
        >
          <span className="text-4xl opacity-30">⚔️</span>
          <p>
            {t({
              ko: "등록된 에이전트가 없습니다",
              en: "No agents registered",
              ja: "登録されたエージェントがいません",
              zh: "暂无已注册代理",
            })}
          </p>
          <p className="text-[10px]">
            {t({
              ko: "에이전트를 추가하고 미션을 시작하세요",
              en: "Add agents and start missions",
              ja: "エージェントを追加してミッションを開始しましょう",
              zh: "添加代理并开始任务",
            })}
          </p>
        </div>
      ) : (
        <div className="relative space-y-5">
          {topAgents.length >= 2 && (
            <div className="flex items-end justify-center gap-4 pb-3 pt-2 sm:gap-6">
              {podiumOrder.map((agent, visualIdx) => {
                const ranks = topAgents.length >= 3 ? [2, 1, 3] : [2, 1];
                const rank = ranks[visualIdx];
                const tier = getRankTier(agent.xp);
                const isFirst = rank === 1;
                const avatarSize = isFirst ? 64 : 48;
                const podiumHeight = isFirst ? "h-24" : rank === 2 ? "h-16" : "h-12";

                return (
                  <div
                    key={agent.id}
                    className={`flex flex-col items-center gap-2 ${isFirst ? "animate-rank-float" : ""}`}
                  >
                    {rank === 1 && (
                      <span
                        className="text-2xl animate-crown-wiggle"
                        style={{ display: "inline-block", filter: "drop-shadow(0 0 12px rgba(255,215,0,0.6))" }}
                      >
                        🥇
                      </span>
                    )}
                    {rank === 2 && (
                      <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px rgba(192,192,192,0.5))" }}>
                        🥈
                      </span>
                    )}
                    {rank === 3 && (
                      <span className="text-lg" style={{ filter: "drop-shadow(0 0 6px rgba(205,127,50,0.5))" }}>
                        🥉
                      </span>
                    )}

                    <div
                      className="relative overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-105"
                      style={{
                        boxShadow: isFirst ? `0 0 20px ${tier.glow}, 0 0 40px ${tier.glow}` : `0 0 12px ${tier.glow}`,
                        border: `2px solid ${tier.color}80`,
                      }}
                    >
                      <AgentAvatar agent={agentMap.get(agent.id)} agents={agents} size={avatarSize} rounded="2xl" />
                    </div>

                    <span
                      className={`max-w-[80px] truncate text-center font-bold ${isFirst ? "text-sm" : "text-xs"}`}
                      style={{ color: tier.color, textShadow: isFirst ? `0 0 8px ${tier.glow}` : "none" }}
                    >
                      {agent.name}
                    </span>

                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: tier.color, textShadow: `0 0 6px ${tier.glow}` }}
                      >
                        {numberFormatter.format(agent.xp)} XP
                      </span>
                      <RankBadge xp={agent.xp} size="sm" />
                    </div>

                    <div
                      className={`${podiumHeight} flex w-20 items-center justify-center rounded-t-xl sm:w-24 animate-podium-rise`}
                      style={{
                        background: `linear-gradient(to bottom, ${tier.color}30, ${tier.color}10)`,
                        border: `1px solid ${tier.color}40`,
                        borderBottom: "none",
                        boxShadow: `inset 0 1px 0 ${tier.color}30, 0 -4px 12px ${tier.glow}`,
                      }}
                    >
                      <span className="text-2xl font-black" style={{ color: `${tier.color}50` }}>
                        #{rank}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {topAgents.length > 3 && (
            <div className="space-y-2 border-t border-white/[0.06] pt-4">
              {topAgents.slice(3).map((agent, idx) => {
                const rank = idx + 4;
                const tier = getRankTier(agent.xp);
                return (
                  <div
                    key={agent.id}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.05] hover:translate-x-1"
                    style={{ borderLeftWidth: "3px", borderLeftColor: `${tier.color}60` }}
                  >
                    <span className="w-8 text-center font-mono text-sm font-black" style={{ color: `${tier.color}80` }}>
                      #{rank}
                    </span>
                    <div
                      className="flex-shrink-0 overflow-hidden rounded-xl"
                      style={{ border: `1px solid ${tier.color}40` }}
                    >
                      <AgentAvatar agent={agentMap.get(agent.id)} agents={agents} size={36} rounded="xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold" style={{ color: "var(--th-text-primary)" }}>
                        {agent.name}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--th-text-muted)" }}>
                        {agent.department || t({ ko: "미지정", en: "Unassigned", ja: "未指定", zh: "未指定" })}
                      </p>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <XpBar xp={agent.xp} maxXp={maxXp} color={tier.color} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: tier.color }}>
                        {numberFormatter.format(agent.xp)}
                      </span>
                      <RankBadge xp={agent.xp} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {topAgents.length === 1 &&
            (() => {
              const agent = topAgents[0];
              const tier = getRankTier(agent.xp);
              return (
                <div
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{
                    background: `linear-gradient(135deg, ${tier.color}15, transparent)`,
                    border: `1px solid ${tier.color}30`,
                    boxShadow: `0 0 20px ${tier.glow}`,
                  }}
                >
                  <span className="text-2xl animate-crown-wiggle" style={{ display: "inline-block" }}>
                    🥇
                  </span>
                  <div
                    className="overflow-hidden rounded-2xl"
                    style={{ border: `2px solid ${tier.color}60`, boxShadow: `0 0 15px ${tier.glow}` }}
                  >
                    <AgentAvatar agent={agentMap.get(agent.id)} agents={agents} size={52} rounded="2xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-black" style={{ color: tier.color }}>
                      {agent.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--th-text-muted)" }}>
                      {agent.department || t({ ko: "미지정", en: "Unassigned", ja: "未指定", zh: "未指定" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-mono text-lg font-black"
                      style={{ color: tier.color, textShadow: `0 0 10px ${tier.glow}` }}
                    >
                      {numberFormatter.format(agent.xp)} XP
                    </p>
                    <RankBadge xp={agent.xp} size="md" />
                  </div>
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}
