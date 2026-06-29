"use client";

import { adminNavGroups } from "@/features/education/constants/navigation";
import { useSidebar } from "@/features/education/context/SidebarContext";
import { cn } from "@/features/education/lib/utils";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SIDEBAR_OPEN_WIDTH = "w-[290px]";
const SIDEBAR_CLOSED_WIDTH = "w-[90px]";

function isActivePath(pathname: string, path: string) {
  return pathname === path || (path !== "/education/dashboard/admin" && pathname.startsWith(`${path}/`));
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const isOpen = isExpanded || isHovered || isMobileOpen;
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(["Hồ sơ nhân sự", "Giảng dạy"]));

  useEffect(() => {
    const activeGroup = adminNavGroups.find((group) =>
      group.items.some((item) => isActivePath(pathname, item.path)),
    );

    if (activeGroup && activeGroup.items.length > 1) {
      setOpenGroups((current) => {
        const next = new Set(current);
        next.add(activeGroup.groupName);
        return next;
      });
    }
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border/80 bg-background shadow-sm transition-all duration-300 ease-in-out",
        isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      {/* Logo Section */}
      <div className="h-[80px] border-b border-gray-100 flex items-center justify-center px-4 overflow-hidden dark:border-slate-800 flex-shrink-0">
        <Link href="/education/dashboard/admin" className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            <div className="relative w-[310px] h-[88px] transition-all duration-300 flex items-center justify-center">
              <Image
                src="/education/images/logo/logo-sidebar-admin-big.png"
                alt="Đại Học Đông Á"
                fill
                priority
                sizes="310px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="relative w-9 h-9 transition-all duration-300">
              <Image
                src="/education/images/logo/logo-sidebar-admin-small.png"
                alt="UDA"
                fill
                priority
                sizes="36px"
                className="object-contain"
              />
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <div className="space-y-1.5">
          {adminNavGroups.map((group, groupIndex) => {
            const groupActive = group.items.some((item) => isActivePath(pathname, item.path));
            const canCollapse = group.items.length > 1;
            const dashboardItem = !canCollapse ? group.items[0] : null;
            const groupOpen = canCollapse && isOpen && openGroups.has(group.groupName);

            if (dashboardItem) {
              const active = isActivePath(pathname, dashboardItem.path);

              return (
                <Link
                  key={group.groupName || groupIndex}
                  href={dashboardItem.path}
                  title={!isOpen ? dashboardItem.name : undefined}
                  className={cn(
                    "group relative flex h-11 items-center rounded-xl text-sm font-semibold transition-all duration-200",
                    isOpen ? "justify-start gap-3 px-3" : "justify-center px-0",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg">
                    {group.icon}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 truncate transition-all duration-200",
                      isOpen ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0",
                    )}
                  >
                    {dashboardItem.name}
                  </span>
                </Link>
              );
            }

            return (
              <section key={group.groupName || groupIndex} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.groupName)}
                  aria-expanded={groupOpen}
                  title={!isOpen ? group.groupName : undefined}
                  className={cn(
                    "group relative flex h-11 w-full items-center rounded-xl text-sm font-semibold transition-all duration-200",
                    isOpen ? "justify-between px-3" : "justify-center px-0",
                    groupActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 h-6 w-1 rounded-r-full bg-primary transition-opacity",
                      groupActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        groupActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {group.icon}
                    </span>
                    <span
                      className={cn(
                        "truncate transition-all duration-200",
                        isOpen ? "opacity-100" : "pointer-events-none w-0 overflow-hidden opacity-0",
                      )}
                    >
                      {group.groupName}
                    </span>
                  </span>
                  {isOpen && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        groupOpen ? "rotate-0" : "-rotate-90",
                        groupActive && "text-primary",
                      )}
                    />
                  )}
                </button>

                {groupOpen && (
                  <div className="ml-4 space-y-0.5 border-l border-border/80 pl-3">
                    {group.items.map((item) => {
                      const active = isActivePath(pathname, item.path);

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={cn(
                            "group/item relative flex h-9 items-center justify-between rounded-lg px-2.5 text-[13px] transition-colors",
                            active
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                                active ? "bg-primary" : "bg-muted-foreground/35 group-hover/item:bg-foreground/50",
                              )}
                            />
                            <span className="truncate">{item.name}</span>
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                                active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-border/80 p-3">
        <div
          className={cn(
            "rounded-xl border border-primary/15 bg-primary/5 text-primary",
            isOpen ? "p-3" : "flex h-11 items-center justify-center",
          )}
        >
          {isOpen ? (
            <div>
              <p className="text-xs font-semibold">Hệ thống đang hoạt động</p>
              <p className="mt-0.5 text-[11px] text-primary/75">UEMS Admin Console</p>
            </div>
          ) : (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </div>
      </div>
    </aside>
  );
}