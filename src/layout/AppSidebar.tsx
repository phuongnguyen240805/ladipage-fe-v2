"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { App3DIcon, type App3DIconName } from "@/components/navigation/App3DIcon";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import {
  useApplications,
  useInstalledApplicationIds,
} from "@/features/app-store/hooks/useApplications";

type NavSubItem = {
  name: string;
  path: string;
  icon?: LucideIcon;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  iconColor?: string;
  app3d?: App3DIconName;
  path?: string;
  appId?: string;
  subItems?: NavSubItem[];
};

const workspaceItems: NavItem[] = [
  {
    name: "Tổng quan",
    path: "/",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    name: "Landing Page",
    path: "/landing-pages",
    iconColor: "text-orange-600 dark:text-orange-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    name: "Bán hàng",
    path: "/ban-hang",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    name: "Khách hàng",
    path: "/khach-hang",
    iconColor: "text-sky-600 dark:text-sky-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    name: "Chăm sóc khách hàng",
    path: "/cskh",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4h-1l-4 3v-3H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/>
      </svg>
    ),
    subItems: [
      { name: "Hội thoại", path: "/cskh/hoi-thoai", icon: MessageCircleMore },
      { name: "Thống kê", path: "/cskh/statistics", icon: BarChart3 },
      { name: "Cài đặt", path: "/cskh/general", icon: Settings },
    ],
  },
  {
    name: "Kedi Work",
    path: "/ladiwork",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    name: "Automation",
    path: "/automation",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    name: "Báo cáo",
    path: "/bao-cao",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconNode: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

// Application icons intentionally use a separate 3D system. A route may appear in
// both sections (for example /ban-hang): workspace keeps its familiar 2D icon,
// while the application entry uses the branded 3D asset.
const applicationItems: NavItem[] = [
  { name: "Kho ứng dụng", path: "/kho-ung-dung", app3d: "store" },
  { name: "Ecom Store", path: "/ban-hang", appId: "2", app3d: "ecommerce" },
  { name: "Dynamic", path: "/automation", appId: "5", app3d: "automation" },
  { name: "Kedi Learning", path: "/e-learning", appId: "6", app3d: "learning" },
  { name: "Kedi Ads", path: "/facebook-ads/manager", appId: "10", app3d: "ads" },
  { name: "Kedi CloudPhone", path: "/cloudphone/cua-hang-cho-thue", appId: "14", app3d: "cloudphone" },
  { name: "Kedi OfferKit", path: "/offerkit", appId: "15", app3d: "offerkit" },
  { name: "Kedi SEO", path: "/ai-seo", appId: "17", app3d: "seo" },
  { name: "Kedi Analytics", path: "/site-metrics", appId: "18", app3d: "analytics" },
  { name: "Kedi Local", path: "/local", appId: "19", app3d: "local" },
  { name: "Kedi Content", path: "/content", appId: "20", app3d: "content" },
  { name: "Kedi Keywords", path: "/keywords", appId: "21", app3d: "keywords" },
  { name: "Kedi Reports", path: "/bao-cao", appId: "22", app3d: "reports" },
  { name: "Kedi Authority", path: "/authority", appId: "23", app3d: "authority" },
  { name: "Kedi AI", path: "/otto", app3d: "ai" },
];

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleSidebar,
  } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const applicationsQuery = useApplications();
  const installedApplicationIds = useInstalledApplicationIds(applicationsQuery.data);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "workspace" | "applications";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isOpen = isExpanded || isHovered || isMobileOpen;

  const prefetchOnIntent = useCallback(
    (path: string) => {
      if (path !== pathname) router.prefetch(path);
    },
    [pathname, router],
  );

  const visibleApplicationItems = useMemo(
    () =>
      applicationItems.filter(
        (item) => !item.appId || installedApplicationIds.has(item.appId),
      ),
    [installedApplicationIds],
  );

  const isActive = useCallback(
    (path: string) =>
      path === pathname || (path !== "/" && Boolean(pathname?.startsWith(`${path}/`))),
    [pathname],
  );

  const isSubActive = useCallback(
    (path: string) => pathname === path || Boolean(pathname?.startsWith(`${path}/`)),
    [pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    const groups: Array<["workspace" | "applications", NavItem[]]> = [
      ["workspace", workspaceItems],
      ["applications", visibleApplicationItems],
    ];

    for (const [type, items] of groups) {
      items.forEach((item, index) => {
        if (item.subItems?.some((subItem) => isSubActive(subItem.path))) {
          setOpenSubmenu({ type, index });
          submenuMatched = true;
        }
      });
    }

    if (!submenuMatched) setOpenSubmenu(null);
  }, [isSubActive, pathname, visibleApplicationItems]);

  useEffect(() => {
    if (!openSubmenu) return;
    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const element = subMenuRefs.current[key];
    if (!element) return;

    setSubMenuHeight((current) => ({
      ...current,
      [key]: element.scrollHeight,
    }));
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    type: "workspace" | "applications",
  ) => {
    setOpenSubmenu((current) =>
      current?.type === type && current.index === index ? null : { type, index },
    );
  };

  const renderMenuItems = (
    items: NavItem[],
    type: "workspace" | "applications",
  ) => (
    <ul className="flex flex-col gap-1">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isApplication = type === "applications";
        const parentActive = Boolean(item.path && isActive(item.path));
        const submenuOpen = openSubmenu?.type === type && openSubmenu.index === index;

        return (
          <li key={`${type}-${item.name}`}>
            {item.subItems ? (
              <button
                type="button"
                onClick={() => handleSubmenuToggle(index, type)}
                className={`menu-item group ${
                  parentActive || submenuOpen ? "menu-item-active" : "menu-item-inactive"
                } ${!isOpen ? "lg:justify-center" : "lg:justify-start"}`}
                aria-expanded={submenuOpen}
                aria-controls={`${type}-submenu-${index}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${item.iconColor ?? "text-current"}`}>
                  {isApplication && item.app3d ? (
                    <App3DIcon name={item.app3d} className="h-8 w-8" />
                  ) : item.iconNode ? (
                    item.iconNode
                  ) : Icon ? (
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                  ) : null}
                </span>
                {isOpen && <span className="menu-item-text min-w-0 truncate">{item.name}</span>}
                {isOpen && (
                  <ChevronDown
                    className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                      submenuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>
            ) : (
              item.path && (
                <Link
                  href={item.path}
                  prefetch={false}
                  onMouseEnter={() => prefetchOnIntent(item.path!)}
                  onFocus={() => prefetchOnIntent(item.path!)}
                  className={`menu-item group ${
                    parentActive ? "menu-item-active" : "menu-item-inactive"
                  } ${!isOpen ? "lg:justify-center" : "lg:justify-start"}`}
                  aria-current={parentActive ? "page" : undefined}
                  title={!isOpen ? item.name : undefined}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${item.iconColor ?? "text-current"}`}>
                    {isApplication && item.app3d ? (
                      <App3DIcon name={item.app3d} className="h-8 w-8 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:scale-105" />
                    ) : item.iconNode ? (
                      item.iconNode
                    ) : Icon ? (
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                    ) : null}
                  </span>
                  {isOpen && <span className="menu-item-text min-w-0 truncate">{item.name}</span>}
                </Link>
              )
            )}

            {item.subItems && isOpen && (
              <div
                id={`${type}-submenu-${index}`}
                ref={(element) => {
                  subMenuRefs.current[`${type}-${index}`] = element;
                }}
                className="overflow-hidden transition-[height] duration-200 ease-out"
                style={{
                  height: submenuOpen
                    ? `${subMenuHeight[`${type}-${index}`] ?? 0}px`
                    : "0px",
                }}
              >
                <ul className="ml-9 mt-1 space-y-1 border-l border-kedi-navy/10 pl-2 dark:border-white/10">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const active = isSubActive(subItem.path);
                    return (
                      <li key={subItem.path}>
                        <Link
                          href={subItem.path}
                          prefetch={false}
                          onMouseEnter={() => prefetchOnIntent(subItem.path)}
                          onFocus={() => prefetchOnIntent(subItem.path)}
                          className={`menu-dropdown-item group ${
                            active ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                          }`}
                          aria-current={active ? "page" : undefined}
                        >
                          {SubIcon && (
                            <SubIcon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                          )}
                          <span className="min-w-0 truncate">{subItem.name}</span>
                          {(subItem.new || subItem.pro) && (
                            <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-kedi-navy dark:bg-kedi-yellow/15 dark:text-kedi-yellow">
                              {subItem.new ? "Mới" : "Pro"}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-[52px] z-50 flex h-[calc(100dvh-52px)] flex-col border-r border-kedi-navy/10 bg-white text-kedi-navy shadow-[1px_0_0_rgba(11,45,91,0.02)] transition-[width,padding,transform] duration-200 ease-out dark:border-white/10 dark:bg-kedi-navy dark:text-white lg:top-0 lg:h-[100dvh] ${
        isExpanded || isMobileOpen ? "px-3" : "px-2.5"
      } ${isOpen ? "w-[240px]" : "w-[72px]"} ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex h-[64px] shrink-0 items-center ${!isOpen ? "justify-center" : "px-1"}`}>
        <Link
          href="/"
          prefetch={false}
          onMouseEnter={() => prefetchOnIntent("/")}
          onFocus={() => prefetchOnIntent("/")}
          className="inline-flex items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-kedi-yellow/30"
          aria-label="Kedi.Media - Tổng quan"
        >
          {isOpen ? (
            <>
              <Image
                src="/brand/kedi-logo-navy.png"
                width={142}
                height={36}
                alt="Kedi.Media"
                className="h-8 w-auto dark:hidden"
                priority
              />
              <Image
                src="/brand/kedi-logo-reverse.png"
                width={142}
                height={36}
                alt="Kedi.Media"
                className="hidden h-8 w-auto dark:block"
                priority
              />
            </>
          ) : (
            <Image
              src="/brand/kedi-icon.png"
              width={34}
              height={34}
              alt="Kedi.Media"
              className="h-8 w-8 object-contain"
              priority
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        <nav className="flex flex-1 flex-col gap-6 pb-5" aria-label="Điều hướng chính">
          <section>
            <h2
              className={`mb-1.5 flex min-h-5 items-center text-xs font-semibold uppercase tracking-[0.08em] text-kedi-navy/45 dark:text-white/45 ${
                !isOpen ? "justify-center" : "px-2.5"
              }`}
            >
              {isOpen ? "Công việc" : <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
            </h2>
            {renderMenuItems(workspaceItems, "workspace")}
          </section>

          <section>
            <h2
              className={`mb-1.5 flex min-h-5 items-center text-xs font-semibold uppercase tracking-[0.08em] text-kedi-navy/45 dark:text-white/45 ${
                !isOpen ? "justify-center" : "px-2.5"
              }`}
            >
              {isOpen ? "Ứng dụng" : <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
            </h2>
            {renderMenuItems(visibleApplicationItems, "applications")}
          </section>
        </nav>

        <div className="border-t border-kedi-navy/10 py-4 dark:border-white/10">
          <Link
            href="/settings"
            prefetch={false}
            onMouseEnter={() => prefetchOnIntent("/settings")}
            onFocus={() => prefetchOnIntent("/settings")}
            className={`menu-item group ${
              isActive("/settings") ? "menu-item-active" : "menu-item-inactive"
            } ${!isOpen ? "lg:justify-center" : "lg:justify-start"}`}
            aria-current={isActive("/settings") ? "page" : undefined}
            title={!isOpen ? "Cài đặt" : undefined}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Settings className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
            </span>
            {isOpen && <span className="menu-item-text">Cài đặt</span>}
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-[224px] z-[60] hidden h-7 w-7 items-center justify-center rounded-full border border-kedi-navy/20 bg-white text-kedi-navy shadow-sm outline-none transition-[background-color,border-color,color,box-shadow] duration-150 hover:border-kedi-yellow hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-kedi-yellow/30 dark:border-kedi-yellow/30 dark:bg-kedi-navy dark:text-white dark:hover:bg-white/10 lg:flex"
        title={isExpanded ? "Thu gọn" : "Mở rộng"}
        aria-label={isExpanded ? "Thu gọn menu" : "Mở rộng menu"}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        )}
      </button>
    </aside>
  );
};

export default AppSidebar;
