"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BarChart3,
  ChevronRight,
  FileClock,
  FilePlus2,
  LayoutDashboard,
  Mail,
  Megaphone,
  PanelsTopLeft,
  Settings,
  Workflow,
  Wrench,
} from "lucide-react";

type FacebookAdsLayoutProps = {
  children: ReactNode;
};

const navigationGroups = [
  {
    label: "Quản lý",
    items: [
      {
        name: "Ads Manager",
        path: "/facebook-ads/manager",
        icon: LayoutDashboard,
      },
      {
        name: "Tạo chiến dịch",
        path: "/facebook-ads/create",
        icon: FilePlus2,
      },
      {
        name: "Bản nháp",
        path: "/facebook-ads/drafts",
        icon: FileClock,
      },
    ],
  },
  {
    label: "Tối ưu",
    items: [
      {
        name: "Báo cáo",
        path: "/facebook-ads/reports",
        icon: BarChart3,
      },
      {
        name: "Quy tắc tự động",
        path: "/facebook-ads/rules",
        icon: Workflow,
      },
      {
        name: "Bộ công cụ",
        path: "/facebook-ads/tools",
        icon: Wrench,
      },
    ],
  },
  {
    label: "Tài sản",
    items: [
      {
        name: "Tài khoản quảng cáo",
        path: "/facebook-ads/tai-khoan-qc",
        icon: Megaphone,
      },
      {
        name: "Business Manager",
        path: "/facebook-ads/tai-khoan-bm",
        icon: Building2,
      },
      {
        name: "Fanpage",
        path: "/facebook-ads/fanpage",
        icon: PanelsTopLeft,
      },
    ],
  },
  {
    label: "Tiện ích",
    items: [
      {
        name: "Email tạm thời",
        path: "/facebook-ads/email-tam-thoi",
        icon: Mail,
      },
      {
        name: "Cài đặt",
        path: "/facebook-ads/cai-dat",
        icon: Settings,
      },
    ],
  },
];

export default function FacebookAdsLayoutShell({
  children,
}: FacebookAdsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="facebook-ads-workspace flex min-h-[calc(100vh-64px)] min-w-0 flex-col bg-background md:flex-row">
      <aside className="shrink-0 border-b border-border bg-card md:w-56 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-border px-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-500 text-white shadow-theme-xs">
              <Megaphone aria-hidden="true" size={18} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Facebook Ads
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Quản lý quảng cáo
              </p>
            </div>
          </div>

          <nav
            aria-label="Điều hướng Facebook Ads"
            className="flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:gap-4 md:overflow-x-visible md:overflow-y-auto md:p-3"
          >
            {navigationGroups.map((group) => (
              <div key={group.label} className="flex shrink-0 gap-1 md:flex-col">
                <p className="hidden px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:block">
                  {group.label}
                </p>
                <div className="flex gap-1 md:flex-col">
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
                        className={`group flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isActive
                            ? "bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon
                          aria-hidden="true"
                          size={16}
                          strokeWidth={isActive ? 2.1 : 1.8}
                          className={isActive ? "text-lime-600 dark:text-lime-400" : ""}
                        />
                        <span className="whitespace-nowrap">{item.name}</span>
                        {isActive && (
                          <ChevronRight
                            aria-hidden="true"
                            size={14}
                            className="ml-auto hidden text-lime-600 dark:text-lime-400 md:block"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden border-t border-border p-3 md:block">
            <div className="rounded-xl bg-muted/70 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-500" />
                <p className="text-xs font-medium text-foreground">Chế độ xem trước</p>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Dữ liệu mẫu, không tác động tài khoản Meta.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
