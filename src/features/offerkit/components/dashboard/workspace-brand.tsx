/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/features/offerkit/components/ui/avatar";
import { ovx } from "@/features/offerkit/lib/sdk";

const DEFAULT_WORKSPACE_NAME = "Marketing Learning Hub";

export function workspaceInitial(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase() || "W";
}

export function DashboardWorkspaceBrand() {
  const { data } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => ovx().workspace.get({}),
  });
  const workspaceName = data?.name?.trim() || DEFAULT_WORKSPACE_NAME;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <Avatar className="size-8 rounded-[0.65rem] bg-primary text-primary-foreground shadow-xs">
        <AvatarFallback className="rounded-[0.65rem] bg-primary text-xs font-semibold text-primary-foreground">
          {workspaceInitial(workspaceName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-semibold">{workspaceName}</span>
        <span className="mt-1 truncate text-xs text-muted-foreground">Facebook + e-learning</span>
      </div>
    </div>
  );
}
