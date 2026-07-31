"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  BotMessageSquare,
  ChevronRight,
  CircleGauge,
  FileClock,
  FilePlus2,
  FileText,
  KeyRound,
  LayoutDashboard,
  Mail,
  Settings,
  ShieldCheck,
  Wifi,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

type FacebookAdsNavigationSidebarProps = {
  pathname: string;
  className?: string;
  variant?: "workspace" | "drawer";
  onNavigate?: () => void;
  onClose?: () => void;
};

const navigationGroups = [
  {
    label: "Quản lý quảng cáo",
    items: [
      { name: "Ads Manager", path: "/facebook-ads/manager", icon: LayoutDashboard },
      { name: "Tạo chiến dịch", path: "/facebook-ads/create", icon: FilePlus2, mark: "new" as const },
      { name: "Bản nháp", path: "/facebook-ads/drafts", icon: FileClock },
      { name: "Phân tích", path: "/facebook-ads/analytics", icon: BarChart3, mark: "new" as const },
    ],
  },
  {
    label: "Tự động hóa",
    items: [
      { name: "Quy tắc & Lịch", path: "/facebook-ads/rules", icon: Workflow, mark: "update" as const },
      { name: "Chia sẻ & Quyền", path: "/facebook-ads/permissions", icon: KeyRound, mark: "new" as const },
      { name: "Vận hành", path: "/facebook-ads/operations", icon: CircleGauge },
    ],
  },
  {
    label: "Báo cáo & Hỗ trợ",
    items: [
      { name: "Báo cáo PDF", path: "/facebook-ads/reports", icon: FileText },
      { name: "Kiểm tra chính sách", path: "/facebook-ads/policy", icon: ShieldCheck, mark: "new" as const },
      { name: "Trung tâm hỗ trợ", path: "/facebook-ads/support", icon: BotMessageSquare },
      { name: "Hướng dẫn", path: "/facebook-ads/guide", icon: BookOpenCheck },
    ],
  },
  {
    label: "Tiện ích",
    items: [
      { name: "Bộ công cụ", path: "/facebook-ads/tools", icon: Wrench },
      { name: "Email tạm", path: "/facebook-ads/email-tam-thoi", icon: Mail },
      { name: "Cài đặt", path: "/facebook-ads/cai-dat", icon: Settings },
    ],
  },
];

const markClasses: Record<string, string> = {
  new: "bg-[#1877F2] text-white",
  update: "bg-emerald-500 text-white",
  fixing: "bg-amber-500 text-white",
};

export default function FacebookAdsNavigationSidebar({
  pathname,
  className = "",
  variant = "workspace",
  onNavigate,
  onClose,
}: FacebookAdsNavigationSidebarProps) {
  const isDrawer = variant === "drawer";

  return (
    <aside
      className={`border-border bg-card ${className}`}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Brand */}
        <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-border px-3">
          <button
            type="button"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "#1877F2" }}
            >
              AM
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-foreground leading-tight">
                AdsMeta
              </p>
              <p className="truncate text-[10px] text-muted-foreground leading-tight">
                Marketing Operations
              </p>
            </div>
          </button>
          {onClose && (
            <button
              type="button"
              aria-label="Đóng menu"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" size={15} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav
          aria-label="Điều hướng Facebook Ads"
          className={
            isDrawer
              ? "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2"
              : "flex gap-1 overflow-x-auto p-2 md:min-h-0 md:flex-1 md:flex-col md:gap-3 md:overflow-x-visible md:overflow-y-auto"
          }
          style={{ scrollbarWidth: "none" }}
        >
          {navigationGroups.map((group) => (
            <div
              key={group.label}
              className={isDrawer ? "flex flex-col gap-0.5" : "flex shrink-0 gap-0.5 md:flex-col"}
            >
              <p
                className={`px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground ${
                  isDrawer ? "" : "hidden md:block"
                }`}
              >
                {group.label}
              </p>
              <div className={isDrawer ? "flex flex-col gap-0.5" : "flex gap-0.5 md:flex-col"}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.path ||
                    (item.path !== "/facebook-ads/manager" &&
                      pathname.startsWith(`${item.path}/`));

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      onClick={onNavigate}
                      className={`group flex h-8 shrink-0 items-center gap-2 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? "font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      style={
                        isActive
                          ? {
                              background: "rgba(24,119,242,0.1)",
                              color: "#1877F2",
                            }
                          : {}
                      }
                    >
                      <Icon
                        aria-hidden="true"
                        size={15}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      <span className="whitespace-nowrap flex-1">{item.name}</span>
                      {item.mark && (
                        <span
                          className={`rounded px-1 py-px text-[8px] font-bold uppercase tracking-wider ${markClasses[item.mark]}`}
                        >
                          {item.mark === "new" ? "NEW" : item.mark === "update" ? "CẬP NHẬT" : "FIX"}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight
                          aria-hidden="true"
                          size={12}
                          style={{ color: "#1877F2" }}
                          className={isDrawer ? "" : "hidden md:block"}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`shrink-0 border-t border-border p-2 ${
            isDrawer ? "" : "hidden md:block"
          }`}
        >
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
            <Wifi size={14} className="text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground truncate">
                Facebook đã kết nối
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Extension online · token server-side
              </p>
            </div>
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"
              style={{ boxShadow: "0 0 0 3px rgba(16,185,129,0.25)" }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
