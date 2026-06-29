"use client";

import { ThemeToggleButton } from "@/features/education/components/common/ThemeToggleButton";
import NotificationDropdown from "@/features/education/components/header/NotificationDropdown";
import UserDropdown from "@/features/education/components/header/UserDropdown";
import { useAuth } from "@/features/education/context/AuthContext";
import { useSidebar } from "@/features/education/context/SidebarContext";
import { cn } from "@/features/education/lib/utils";
import {
  ChevronsLeft,
  ChevronsRight,
  Command,
  Menu,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";

interface AppHeaderProps {
  role?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  super_admin: "Quản trị viên cấp cao",
  lecturer: "Giảng viên",
  student: "Sinh viên",
  parents: "Phụ huynh",
  consultant: "Tư vấn tuyển sinh",
  "branch-management": "Quản lý cơ sở",
};

const AppHeader: React.FC<AppHeaderProps> = ({ role = "admin" }) => {
  const { isExpanded, isHovered, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSidebarOpen = isExpanded || isHovered;
  const currentRole = user?.role || role;
  const roleLabel = useMemo(() => roleLabels[currentRole] || "Người dùng hệ thống", [currentRole]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-40 h-20 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "lg:pl-[290px]" : "lg:pl-[90px]",
      )}
    >
      <div className="flex h-full w-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={toggleMobileSidebar}
            title="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-primary lg:inline-flex"
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Thu gọn menu" : "Mở rộng menu"}
          >
            {isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
          </button>

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-foreground">Bảng điều khiển đào tạo</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          <div className="relative hidden w-full max-w-[520px] md:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm sinh viên, giảng viên, môn học..."
              className="h-10 w-full rounded-xl border border-input bg-muted/40 pl-10 pr-16 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-3 focus:ring-ring/20"
            />
            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />
              K
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary md:block">
            {roleLabel}
          </div>
          <ThemeToggleButton />
          <NotificationDropdown href={`/education/dashboard/${role}/notifications`} />
          <div className="mx-1 hidden h-8 w-px bg-border sm:block" />
          <UserDropdown role={currentRole} />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
