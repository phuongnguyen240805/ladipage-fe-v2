/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {
  getDashboardRole,
  requireDashboardSession,
} from "@/features/offerkit/lib/session";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/features/offerkit/components/ui/sidebar";
import { DashboardNav } from "@/features/offerkit/components/dashboard/nav";
import { UserMenu } from "@/features/offerkit/components/dashboard/user-menu";
import { DashboardWorkspaceBrand } from "@/features/offerkit/components/dashboard/workspace-brand";
import { QueryProvider } from "@/features/offerkit/components/query-provider";
import { Toaster } from "@/features/offerkit/components/ui/sonner";
import { TooltipProvider } from "@/features/offerkit/components/ui/tooltip";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDashboardSession();

  return (
    <QueryProvider>
      <TooltipProvider delay={300}>
        <SidebarProvider className="h-[calc(100dvh-52px)] min-h-0 overflow-hidden">
          <Sidebar collapsible="none" className="border-r border-sidebar-border">
            <SidebarHeader>
              <DashboardWorkspaceBrand />
            </SidebarHeader>
            <SidebarContent>
              <DashboardNav role={getDashboardRole(session)} />
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <UserMenu name={session.user.name} email={session.user.email} />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
              <div className="text-sm font-medium text-muted-foreground">OfferKit</div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryProvider>
  );
}
