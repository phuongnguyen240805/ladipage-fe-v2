/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { ShieldCheck, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/features/offerkit/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/features/offerkit/components/ui/sidebar";

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent" />}
      >
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
          <User className="size-4 text-primary" />
        </div>
        <div className="flex flex-col items-start text-left text-xs group-data-[collapsible=icon]:hidden">
          <span className="truncate font-medium">{name}</span>
          <span className="truncate text-muted-foreground">{email}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuItem disabled>
          <ShieldCheck className="size-4" />
          <span>Demo access enabled</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
