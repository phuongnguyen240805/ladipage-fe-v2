"use client";

import {
  ArchiveRestore,
  BarChart3,
  ChevronDown,
  Flag,
  Headphones,
  Megaphone,
  MessageSquareText,
  PhoneCall,
  Star,
  Tags,
  UsersRound,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { StatisticView } from "@/components/customer-care/analytics/statistics/types";
import {
  AdsStatistic,
  CallCenterStatistic,
  EngagementStatistic,
  ExportStatistic,
  FeedbackStatistic,
  OverviewStatistic,
  PageStatistic,
  TagStatistic,
  UserStatistic,
} from "@/components/customer-care/analytics/statistics/StatisticsSections";

type StatisticNavigationItem = {
  id: StatisticView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const statisticNavigationItems: StatisticNavigationItem[] = [
  { id: "overview", label: "Tổng quan", icon: BarChart3 },
  { id: "page", label: "Trang", icon: Flag },
  { id: "user", label: "Nhân viên", icon: UsersRound },
  { id: "engagement", label: "Tương tác", icon: MessageSquareText },
  { id: "tag", label: "Thẻ hội thoại", icon: Tags },
  { id: "call-center", label: "Tổng đài", icon: PhoneCall },
  { id: "ads", label: "Quảng cáo", icon: Megaphone },
  { id: "feedback", label: "Đánh giá", icon: Star },
  { id: "export", label: "Sao lưu", icon: ArchiveRestore },
];

const statisticViewComponentMap: Record<StatisticView, React.ComponentType> = {
  overview: OverviewStatistic,
  page: PageStatistic,
  user: UserStatistic,
  engagement: EngagementStatistic,
  tag: TagStatistic,
  "call-center": CallCenterStatistic,
  ads: AdsStatistic,
  feedback: FeedbackStatistic,
  export: ExportStatistic,
};

const legacyStatisticViewAliases: Record<string, StatisticView> = {
  staff: "user",
  tags: "tag",
  ratings: "feedback",
  backup: "export",
};

function isStatisticView(value: string | null): value is StatisticView {
  return statisticNavigationItems.some((item) => item.id === value);
}

function resolveStatisticView(value: string | null): StatisticView {
  if (isStatisticView(value)) return value;
  if (value && legacyStatisticViewAliases[value]) return legacyStatisticViewAliases[value];
  return "overview";
}

export function CustomerCareStatisticsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const requestedView = searchParams.get("view");
  const currentView = resolveStatisticView(requestedView);
  const ActiveStatisticView = statisticViewComponentMap[currentView];
  const currentNavigationItem = useMemo(
    () => statisticNavigationItems.find((item) => item.id === currentView) ?? statisticNavigationItems[0],
    [currentView]
  );

  const CurrentMobileIcon = currentNavigationItem.icon;

  const replaceStatisticView = useCallback((view: StatisticView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "overview") params.delete("view");
    else params.set("view", view);
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleStatisticViewChange = (view: StatisticView) => {
    replaceStatisticView(view);
    setIsMobileNavigationOpen(false);
  };

  useEffect(() => {
    if (requestedView && requestedView !== currentView) replaceStatisticView(currentView);
  }, [currentView, replaceStatisticView, requestedView]);

  return (
    <div className="flex h-full min-h-0 bg-[#f4f7f5] text-slate-900 dark:bg-[#101412] dark:text-slate-100">
      <aside className="hidden w-[236px] shrink-0 border-r border-slate-200 bg-white px-4 py-5 dark:border-white/[0.07] dark:bg-[#121715] lg:flex lg:flex-col">
        <div className="px-2 pb-5">
          <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Thống kê</div>
          <div className="mt-1 text-[11px] text-slate-400">Trung tâm báo cáo CSKH</div>
        </div>
        <nav className="space-y-1">
          {statisticNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === currentView;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleStatisticViewChange(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-lime-500/15 font-semibold text-lime-700 dark:bg-lime-500/10 dark:text-lime-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? "text-lime-600 dark:text-lime-400" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
                {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-lime-500" />}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-lime-200 bg-lime-50 p-3 dark:border-lime-500/15 dark:bg-lime-500/[0.06]">
          <div className="flex items-center gap-2 text-xs font-semibold text-lime-800 dark:text-lime-300"><Headphones className="h-4 w-4" /> Phân tích CSKH</div>
          <p className="mt-2 text-[10px] leading-4 text-lime-700/70 dark:text-lime-200/60">Theo dõi hiệu suất xử lý và chất lượng chăm sóc khách hàng.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/[0.07] dark:bg-[#121715]/95 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavigationOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10"
          >
            <span className="flex items-center gap-2 text-sm font-semibold"><CurrentMobileIcon className="h-4 w-4 text-lime-500" />{currentNavigationItem.label}</span>
            <ChevronDown className={`h-4 w-4 transition ${isMobileNavigationOpen ? "rotate-180" : ""}`} />
          </button>
          {isMobileNavigationOpen && (
            <div className="absolute left-4 right-4 top-[68px] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#171c1a]">
              {statisticNavigationItems.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => handleStatisticViewChange(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${item.id === currentView ? "bg-lime-500/15 text-lime-700 dark:text-lime-300" : "text-slate-600 dark:text-slate-300"}`}><Icon className="h-4 w-4" />{item.label}</button>;
              })}
            </div>
          )}
        </div>
        <div className="mx-auto max-w-[1560px] p-4 sm:p-5 xl:p-6">
          <ActiveStatisticView />
        </div>
      </main>
    </div>
  );
}

// Compatibility export used by the first statistics clone.
export const StatisticsWorkspace = CustomerCareStatisticsWorkspace;
