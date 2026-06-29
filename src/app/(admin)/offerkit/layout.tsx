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
        <SidebarProvider className="min-h-[calc(100vh-46px)]">
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
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
              <div className="text-sm font-medium text-muted-foreground">OfferKit</div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryProvider>
  );
}
