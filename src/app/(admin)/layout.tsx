"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import MockTierPanel from "@/components/dev/MockTierPanel";
import { LadiFeedbackProvider } from "@/components/feedback/LadiFeedbackProvider";
import { useFacebookAdsEmbedContext } from "@/features/facebook-ads/runtime/useFacebookAdsEmbedContext";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const isEmbedded = useFacebookAdsEmbedContext();
  const isFacebookAds = pathname?.startsWith("/facebook-ads");
  const isCloudPhone = pathname?.startsWith("/cloudphone");
  const isOffice = pathname?.startsWith("/office");
  const isELearning = pathname?.startsWith("/e-learning");
  const isOfferKit = pathname?.startsWith("/offerkit");
  const isCustomerCare = pathname?.startsWith("/cskh");

  // Dynamic class for main content margin based on sidebar state
  // Facebook Ads keeps the primary LadiPage navigation on the web workspace.
  // Only the extension embed needs the full-width AdsMeta surface.
  const hidePrimarySidebar = isEmbedded;
  const mainContentMargin = hidePrimarySidebar
    ? "ml-0"
    : isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
        ? "lg:ml-[216px]"
        : "lg:ml-[72px]";

  const isAiSeo = pathname?.startsWith("/ai-seo");

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      {!hidePrimarySidebar && (
        <>
          <AppSidebar />
          <Backdrop />
        </>
      )}
      {/* Main Content Area */}
      <div
        className={`min-w-0 flex-1 overflow-x-hidden transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        {!isEmbedded && !isFacebookAds && <AppHeader />}
        {/* Page Content */}
        <div className={isEmbedded || isFacebookAds || isCloudPhone || isOffice || isELearning || isOfferKit || isAiSeo || isCustomerCare ? "min-w-0 w-full" : "p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6" }>{children}</div>
      </div>
      {!isEmbedded && !isFacebookAds && <MockTierPanel />}
      <LadiFeedbackProvider />
    </div>
  );
}
