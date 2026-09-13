"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LadiFeedbackProvider } from "@/components/feedback/LadiFeedbackProvider";
import { useSidebar } from "@/context/SidebarContext";
import { useFacebookAdsEmbedContext } from "@/features/facebook-ads/runtime/useFacebookAdsEmbedContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

/**
 * Interactive admin chrome extracted from the route layout.
 * Keep the DOM structure/classes equivalent to the pre-hardening layout so the
 * provider-boundary refactor does not become an accidental UI redesign.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const isEmbedded = useFacebookAdsEmbedContext();
  const isFacebookAds = pathname?.startsWith("/facebook-ads");
  const isCloudPhone = pathname?.startsWith("/cloudphone");
  const isOffice = pathname?.startsWith("/office");
  const isELearning = pathname?.startsWith("/e-learning");
  const isOfferKit = pathname?.startsWith("/offerkit");
  const isCustomerCare = pathname?.startsWith("/cskh");
  const isLandingEditor = Boolean(
    pathname?.startsWith("/landing-pages/") && pathname?.endsWith("/edit"),
  );

  const hidePrimarySidebar = isEmbedded;
  const mainContentMargin = hidePrimarySidebar
    ? "ml-0"
    : isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
        ? "lg:ml-[216px]"
        : "lg:ml-[72px]";

  const isAiSeo = pathname?.startsWith("/ai-seo");
  const hasDedicatedTypography =
    isEmbedded ||
    isFacebookAds ||
    isCloudPhone ||
    isOffice ||
    isELearning ||
    isOfferKit ||
    isCustomerCare ||
    isLandingEditor;
  const pageContentClass =
    isEmbedded ||
    isFacebookAds ||
    isCloudPhone ||
    isOffice ||
    isELearning ||
    isOfferKit ||
    isAiSeo ||
    isCustomerCare
      ? "min-w-0 w-full"
      : "mx-auto w-full max-w-[1600px] p-4 md:p-5 xl:p-6";

  return (
    <div className="ladi-app-shell min-h-[100dvh] xl:flex">
      {!hidePrimarySidebar && (
        <>
          <AppSidebar />
          <Backdrop />
        </>
      )}
      <div
        className={`ladi-main-workspace min-w-0 flex-1 overflow-x-hidden ${mainContentMargin}`}
      >
        {!isEmbedded && !isFacebookAds && <AppHeader />}
        <div
          className={`${pageContentClass}${
            hasDedicatedTypography ? "" : " ladi-admin-ui"
          }`}
        >
          {children}
        </div>
      </div>
      <LadiFeedbackProvider />
    </div>
  );
}
