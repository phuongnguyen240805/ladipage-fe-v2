import type { CustomSkillEntry, SkillLearnProvider } from "@/lib/claw-api";
import { providerLabel, type TFunction } from "./model";

interface CustomSkillSectionProps {
  t: TFunction;
  customSkills: CustomSkillEntry[];
  localeTag: string;
  onDeleteSkill: (skillName: string) => void;
}

export default function CustomSkillSection({ t, customSkills, localeTag, onDeleteSkill }: CustomSkillSectionProps) {
  if (customSkills.length === 0) return null;

  return (
    <div className="custom-skill-list rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-violet-200 flex items-center gap-2">
          <span>✏️</span>
          {t({ ko: "커스텀 스킬", en: "Custom Skills", ja: "カスタムスキル", zh: "自定义技能" })}
          <span className="text-[11px] text-slate-500 font-normal">({customSkills.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {customSkills.map((skill) => (
          <div
            key={skill.skillName}
            className="custom-skill-card flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{skill.skillName}</div>
              <div className="text-[10px] text-slate-500">
                {skill.providers.map((provider) => providerLabel(provider as SkillLearnProvider)).join(", ")}
                {" · "}
                {new Date(skill.createdAt).toLocaleDateString(localeTag)}
              </div>
            </div>
            <button
              onClick={() => onDeleteSkill(skill.skillName)}
              className="shrink-0 ml-2 text-[10px] px-2 py-0.5 rounded border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
            >
              {t({ ko: "삭제", en: "Delete", ja: "削除", zh: "删除" })}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
