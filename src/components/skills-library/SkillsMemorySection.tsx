import type { Agent } from "../../types";
import SkillHistoryPanel from "../SkillHistoryPanel";
import type { TFunction } from "./model";

interface SkillsMemorySectionProps {
  t: TFunction;
  agents: Agent[];
  historyRefreshToken: number;
  onRefreshHistory: () => void;
}

export default function SkillsMemorySection({
  t,
  agents,
  historyRefreshToken,
  onRefreshHistory,
}: SkillsMemorySectionProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">
          {t({ ko: "학습 메모리", en: "Learning Memory", ja: "学習メモリ", zh: "学习记忆" })}
        </div>
        <div className="text-[11px] text-slate-500">
          {t({ ko: "CLI별 스킬 이력", en: "Per-CLI skill history", ja: "CLI別スキル履歴", zh: "按 CLI 的技能记录" })}
        </div>
      </div>
      <SkillHistoryPanel
        agents={agents}
        refreshToken={historyRefreshToken}
        onLearningDataChanged={onRefreshHistory}
        className="h-[380px]"
      />
    </div>
  );
}
