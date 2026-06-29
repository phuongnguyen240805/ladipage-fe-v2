"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminNavGroups } from "@/features/education/constants/navigation";
import { AuthProvider } from "@/features/education/context/AuthContext";
import { SidebarProvider as EducationSidebarProvider } from "@/features/education/context/SidebarContext";
import { ThemeProvider as EducationThemeProvider } from "@/features/education/context/ThemeContext";
import { cn } from "@/features/education/lib/utils";
import { ChevronDown, LogOut } from "lucide-react";
import { Toaster } from "sonner";

const quickRoles = [
  { label: "Quản trị viên", role: "admin", path: "/e-learning/tong-quan" },
  { label: "Giảng viên", role: "lecturer", path: "/e-learning/lecturer" },
  { label: "Sinh viên", role: "student", path: "/e-learning/student/notifications" },
  { label: "Phụ huynh", role: "parents", path: "/e-learning/parents" },
  { label: "Tư vấn", role: "consultant", path: "/e-learning/consultant" },
  { label: "Cơ sở", role: "branch-management", path: "/e-learning/branch-management" },
];

const eLearningRouteMap: Record<string, string> = {
  "/education/dashboard/admin": "/e-learning/tong-quan",
  "/education/dashboard/admin/students": "/e-learning/sinh-vien",
  "/education/dashboard/admin/lecturers": "/e-learning/giang-vien",
  "/education/dashboard/admin/courses": "/e-learning/khoa-hoc",
  "/education/dashboard/admin/schedules": "/e-learning/thoi-khoa-bieu",
  "/education/dashboard/admin/reports": "/e-learning/bao-cao",
  "/education/dashboard/admin/settings": "/e-learning/thiet-lap",
};

function resolveNavPath(path: string) {
  return eLearningRouteMap[path] ?? "/e-learning/danh-muc";
}

function isActivePath(pathname: string, path: string) {
  return pathname === path || (path !== "/e-learning/tong-quan" && pathname.startsWith(`${path}/`));
}

function resolveRoleFromPath(pathname: string) {
  return quickRoles.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.role ?? "admin";
}

export default function ELearningLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [accountOpen, setAccountOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(["Hồ sơ nhân sự", "Giảng dạy"]));
  const selectedRoleLabel = quickRoles.find((item) => item.role === selectedRole)?.label ?? "Admin";

  useEffect(() => {
    setSelectedRole(resolveRoleFromPath(pathname));

    const activeGroup = adminNavGroups.find((group) =>
      group.items.some((item) => isActivePath(pathname, resolveNavPath(item.path))),
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
  const signOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    document.cookie = "user-token=; path=/; max-age=0";
    document.cookie = "user-role=; path=/; max-age=0";
    setAccountOpen(false);
    router.push("/education/dashboard/admin/signin");
  };

  return (
    <EducationThemeProvider>
      <EducationSidebarProvider>
        <AuthProvider>
          <div className="flex min-h-[calc(100vh-46px)] flex-col overflow-hidden rounded-br-2xl rounded-bl-2xl rounded-tr-2xl bg-[#f8fafc] shadow-theme-xs dark:bg-[#0c0d14] md:flex-row">
      <aside className="flex w-full shrink-0 select-none flex-col border-r border-gray-100 bg-white dark:border-gray-800/60 dark:bg-[#090a0f] md:w-[290px]">
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <div className="space-y-1.5">
            {adminNavGroups.map((group, groupIndex) => {
              const groupActive = group.items.some((item) => isActivePath(pathname, resolveNavPath(item.path)));
              const canCollapse = group.items.length > 1;
              const dashboardItem = !canCollapse ? group.items[0] : null;
              const groupOpen = canCollapse && openGroups.has(group.groupName);

              if (dashboardItem) {
                const dashboardPath = resolveNavPath(dashboardItem.path);
                const active = isActivePath(pathname, dashboardPath);

                return (
                  <Link
                    key={group.groupName || groupIndex}
                    href={dashboardPath}
                    className={cn(
                      "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200",
                      active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg">{group.icon}</span>
                    <span className="min-w-0 truncate">{dashboardItem.name}</span>
                  </Link>
                );
              }

              return (
                <section key={group.groupName || groupIndex} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.groupName)}
                    aria-expanded={groupOpen}
                    className={cn(
                      "group relative flex h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold transition-all duration-200",
                      groupActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className={cn("absolute left-0 h-6 w-1 rounded-r-full bg-primary transition-opacity", groupActive ? "opacity-100" : "opacity-0")} />
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          groupActive ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {group.icon}
                      </span>
                      <span className="truncate">{group.groupName}</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        groupOpen ? "rotate-0" : "-rotate-90",
                        groupActive && "text-primary",
                      )}
                    />
                  </button>

                  {groupOpen && (
                    <div className="ml-4 space-y-0.5 border-l border-border/80 pl-3">
                      {group.items.map((item) => {
                        const itemPath = resolveNavPath(item.path);
                        const active = isActivePath(pathname, itemPath);

                        return (
                          <Link
                            key={item.path}
                            href={itemPath}
                            className={cn(
                              "group/item flex h-9 items-center justify-between rounded-lg px-2.5 text-[13px] transition-colors",
                              active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full transition-colors", active ? "bg-primary" : "bg-muted-foreground/35 group-hover/item:bg-foreground/50")} />
                              <span className="truncate">{item.name}</span>
                            </span>
                            {item.badge && (
                              <span className={cn("ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none", active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
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
          <div className="mb-3 rounded-xl border border-primary/15 bg-primary/5 p-3 text-primary">
            <p className="text-xs font-semibold">Hệ thống đang hoạt động</p>
            <p className="mt-0.5 text-[11px] text-primary/75">UEMS Admin Console</p>
          </div>
        </div>
      </aside>

            <main className="min-w-0 flex-1 bg-[#f8fafc] dark:bg-[#0d0e15]">
              <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur dark:border-gray-800/60 dark:bg-[#090a0f]/95 md:px-6">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">E-Learning</p>
                  <p className="truncate text-xs text-gray-500">{selectedRoleLabel}</p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((current) => !current)}
                    className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                    aria-label="Mở menu tài khoản"
                  >
                    <img src="/images/user/owner.jpg" alt="Tài khoản" className="size-9 rounded-full object-cover" />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-13 z-30 w-[220px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-[#0c0d14]">
                      <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Demo {selectedRoleLabel}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{selectedRole}@demo.local</p>
                      </div>
                      <button
                        type="button"
                        onClick={signOut}
                        className="mt-2 flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-red-600 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {children}
            </main>
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </EducationSidebarProvider>
    </EducationThemeProvider>
  );
}
