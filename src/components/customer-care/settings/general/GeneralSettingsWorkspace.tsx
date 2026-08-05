"use client";

import {
  Bot,
  ChevronDown,
  Cloud,
  History,
  MessageCircleMore,
  Monitor,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { settingViewAliases } from "./data";
import {
  AiSetting,
  DisplaySetting,
  GeneralSetting,
  ReplyHelperSetting,
  RoundRobinSetting,
  SettingPermissions,
  SyncSetting,
  TagSetting,
  ToolSetting,
  UpdateHistories,
} from "./SettingsViews";
import type { SettingView } from "./types";

type SettingNavigationItem = {
  id: SettingView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  beta?: boolean;
};

const settingNavigationItems: SettingNavigationItem[] = [
  { id: "general", label: "Cài đặt chung", icon: Settings },
  { id: "tag", label: "Thẻ hội thoại", icon: Tags },
  { id: "ai", label: "Trợ lý AI", icon: Sparkles, beta: true },
  { id: "reply", label: "Hỗ trợ trả lời", icon: MessageCircleMore },
  { id: "display", label: "Giao diện", icon: Monitor },
  { id: "round-robin", label: "Chế độ xoay vòng", icon: RefreshCcw },
  { id: "sync", label: "Đồng bộ", icon: Cloud },
  { id: "tools", label: "Công cụ", icon: Wrench },
  { id: "setting_permissions", label: "Phân quyền", icon: UserRoundCog },
  { id: "update_histories", label: "Lịch sử", icon: History },
];

const settingViewComponentMap: Record<SettingView, React.ComponentType> = {
  general: GeneralSetting,
  tag: TagSetting,
  ai: AiSetting,
  reply: ReplyHelperSetting,
  display: DisplaySetting,
  "round-robin": RoundRobinSetting,
  sync: SyncSetting,
  tools: ToolSetting,
  "setting_permissions": SettingPermissions,
  "update_histories": UpdateHistories,
};

function isSettingView(value: string | null): value is SettingView {
  return settingNavigationItems.some((item) => item.id === value);
}

function resolveSettingView(value: string | null): SettingView {
  if (isSettingView(value)) return value;
  if (value && settingViewAliases[value]) return settingViewAliases[value];
  return "general";
}

export function GeneralSettingsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const requestedView = searchParams.get("view");
  const currentView = resolveSettingView(requestedView);
  const ActiveSettingView = settingViewComponentMap[currentView];
  const currentNavigationItem = useMemo(
    () => settingNavigationItems.find((item) => item.id === currentView) ?? settingNavigationItems[0],
    [currentView]
  );
  const CurrentMobileIcon = currentNavigationItem.icon;

  const replaceSettingView = useCallback((view: SettingView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "general") params.delete("view");
    else params.set("view", view);
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleSettingViewChange = (view: SettingView) => {
    replaceSettingView(view);
    setIsMobileNavigationOpen(false);
  };

  useEffect(() => {
    if (requestedView && requestedView !== currentView) replaceSettingView(currentView);
  }, [currentView, replaceSettingView, requestedView]);

  return (
    <div className="flex h-full min-h-0 bg-[#f4f7f5] text-slate-900 dark:bg-[#1b211f] dark:text-slate-100">
      <aside className="hidden w-[236px] shrink-0 border-r border-slate-200 bg-white px-4 py-5 dark:border-white/[0.06] dark:bg-[#121715] lg:flex lg:flex-col">
        <div className="px-2 pb-4">
          <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Cài đặt</div>
        </div>
        <nav className="space-y-1">
          {settingNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === currentView;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSettingViewChange(item.id)}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                  isActive
                    ? "bg-lime-500/15 font-semibold text-lime-700 dark:bg-white/[0.06] dark:text-lime-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? "text-lime-600 dark:text-lime-400" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-300"}`} />
                <span>{item.label}</span>
                {item.beta && <span className="ml-auto rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">Beta</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-lime-200 bg-lime-50 p-3 dark:border-lime-500/15 dark:bg-lime-500/[0.05]">
          <div className="flex items-center gap-2 text-xs font-semibold text-lime-800 dark:text-lime-300"><ShieldCheck className="h-4 w-4" /> Cấu hình CSKH</div>
          <p className="mt-2 text-[10px] leading-4 text-lime-700/70 dark:text-lime-200/60">Các màn hình được tổ chức theo nhóm route cài đặt của hệ thống nguồn và dùng màu LadiPage.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/[0.06] dark:bg-[#121715]/95 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavigationOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10"
          >
            <span className="flex items-center gap-2 text-sm font-semibold"><CurrentMobileIcon className="h-4 w-4 text-lime-500" />{currentNavigationItem.label}</span>
            <ChevronDown className={`h-4 w-4 transition ${isMobileNavigationOpen ? "rotate-180" : ""}`} />
          </button>
          {isMobileNavigationOpen && (
            <div className="absolute left-4 right-4 top-[68px] max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#171c1a]">
              {settingNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSettingViewChange(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${item.id === currentView ? "bg-lime-500/15 text-lime-700 dark:text-lime-300" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    <Icon className="h-4 w-4" />{item.label}
                    {item.beta && <span className="ml-auto text-[10px] text-amber-500">Beta</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="mx-auto max-w-[1220px] p-4 sm:p-5 xl:p-7">
          <ActiveSettingView />
        </div>
      </main>
    </div>
  );
}

export const CustomerCareSettingsWorkspace = GeneralSettingsWorkspace;
