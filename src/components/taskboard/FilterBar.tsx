import type { Agent, Department } from "../../types";
import { useI18n } from "../../i18n";
import { CustomSelect } from "@/components/ui/select/Select";
import AgentSelect from "../AgentSelect";
import { TASK_TYPE_OPTIONS, taskTypeLabel } from "./constants";

interface FilterBarProps {
  agents: Agent[];
  departments: Department[];
  filterDept: string;
  filterAgent: string;
  filterType: string;
  search: string;
  onFilterDept: (value: string) => void;
  onFilterAgent: (value: string) => void;
  onFilterType: (value: string) => void;
  onSearch: (value: string) => void;
}

export default function FilterBar({
  agents,
  departments,
  filterDept,
  filterAgent,
  filterType,
  search,
  onFilterDept,
  onFilterAgent,
  onFilterType,
  onSearch,
}: FilterBarProps) {
  const { t, language: locale } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[140px] flex-1 sm:min-w-[180px]">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔎</span>
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={t({ ko: "업무 검색...", en: "Search tasks...", ja: "タスク検索...", zh: "搜索任务..." })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-8 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <CustomSelect
        value={filterDept}
        onChange={onFilterDept}
        options={[
          { value: "", label: t({ ko: "전체 부서", en: "All Departments", ja: "全部署", zh: "全部门" }) },
          ...departments.map((department) => ({
            value: department.id,
            label: `${department.icon} ${locale === "ko" ? department.name_ko : department.name}`,
          })),
        ]}
        className="min-w-[150px]"
      />

      <AgentSelect
        agents={agents}
        departments={departments}
        value={filterAgent}
        onChange={onFilterAgent}
        placeholder={t({ ko: "전체 에이전트", en: "All Agents", ja: "全エージェント", zh: "全部代理" })}
        size="md"
      />

      <CustomSelect
        value={filterType}
        onChange={onFilterType}
        options={[
          { value: "", label: t({ ko: "전체 유형", en: "All Types", ja: "全タイプ", zh: "全部类型" }) },
          ...TASK_TYPE_OPTIONS.map((typeOption) => ({
            value: typeOption.value,
            label: taskTypeLabel(typeOption.value, t),
          })),
        ]}
        className="min-w-[140px]"
      />
    </div>
  );
}
