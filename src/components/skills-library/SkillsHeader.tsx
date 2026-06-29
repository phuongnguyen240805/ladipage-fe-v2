import type { TFunction } from "./model";

interface SkillsHeaderProps {
  t: TFunction;
  skillsCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: "rank" | "name" | "installs";
  onSortByChange: (value: "rank" | "name" | "installs") => void;
  onOpenCustomSkillModal: () => void;
}

export default function SkillsHeader({
  t,
  skillsCount,
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  onOpenCustomSkillModal,
}: SkillsHeaderProps) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📚</span>
            {t({
              ko: "Agent Skills 문서고",
              en: "Agent Skills Library",
              ja: "Agent Skills ライブラリ",
              zh: "Agent Skills 资料库",
            })}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t({
              ko: "AI 에이전트 스킬 디렉토리 · skills.sh 실시간 데이터",
              en: "AI agent skill directory · live skills.sh data",
              ja: "AI エージェントスキルディレクトリ · skills.sh リアルタイムデータ",
              zh: "AI 代理技能目录 · skills.sh 实时数据",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCustomSkillModal}
            className="custom-skill-add-btn flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-600/30 transition-all"
            title={t({
              ko: "커스텀 스킬 직접 추가",
              en: "Add custom skill",
              ja: "カスタムスキルを追加",
              zh: "添加自定义技能",
            })}
          >
            <span className="text-base">✏️</span>
            {t({ ko: "커스텀 스킬 추가", en: "Add Custom Skill", ja: "カスタムスキル追加", zh: "添加自定义技能" })}
          </button>
          <div className="text-right">
            <div className="text-2xl font-bold text-empire-gold">{skillsCount}</div>
            <div className="text-xs text-slate-500">
              {t({ ko: "등록된 스킬", en: "Registered skills", ja: "登録済みスキル", zh: "已收录技能" })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t({
              ko: "스킬 검색... (이름, 저장소, 카테고리)",
              en: "Search skills... (name, repo, category)",
              ja: "スキル検索...（名前・リポジトリ・カテゴリ）",
              zh: "搜索技能...（名称、仓库、分类）",
            })}
            className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              &times;
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as "rank" | "name" | "installs")}
          className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
        >
          <option value="rank">{t({ ko: "순위순", en: "By Rank", ja: "順位順", zh: "按排名" })}</option>
          <option value="installs">
            {t({ ko: "설치순", en: "By Installs", ja: "インストール順", zh: "按安装量" })}
          </option>
          <option value="name">{t({ ko: "이름순", en: "By Name", ja: "名前順", zh: "按名称" })}</option>
        </select>
      </div>
    </div>
  );
}
