"use client";

import { useMemo } from "react";
import {
  useApplications,
  useInstalledApplicationIds,
} from "@/features/app-store/hooks/useApplications";
import { usePlatformAuth } from "@/features/auth/hooks/usePlatformAuth";
import { useBillingUsage } from "@/features/billing/hooks/useBillingUsage";
import { useLandingAiQuota } from "@/features/landing-ai/hooks/useLandingAiQuota";
import {
  WEBSITE_BUILDER_APP_ID,
} from "@/features/landing-pages/constants";
import {
  canAccessDomainsTab,
  canAccessLandingHub,
  canAccessLeadsTab,
  canApplyTemplate,
  canCreateDomain,
  canCreateAiLandingPage,
  canCreateLandingPage,
  canPublishLandingPage,
  canUseAdvancedBuilderBlocks,
  canUseProTemplate,
  isProTemplate,
  type LandingAccessContext,
  type LandingTemplateTierSource,
} from "@/lib/access/landing-access";

export function useLandingAccess() {
  const { permissions, isLoading: authLoading } = usePlatformAuth();
  const billingQuery = useBillingUsage();
  const aiQuotaQuery = useLandingAiQuota();
  const applicationsQuery = useApplications();
  const installedApplicationIds = useInstalledApplicationIds(applicationsQuery.data);
  const websiteBuilderInstalled = installedApplicationIds.has(WEBSITE_BUILDER_APP_ID);

  const ctx: LandingAccessContext = useMemo(
    () => ({
      permissions: permissions ?? [],
      subscriptionTier: billingQuery.data?.subscriptionTier ?? "free",
      billingUsage: billingQuery.data,
      aiGenerationUsage: aiQuotaQuery.data
        ? { used: aiQuotaQuery.data.used, limit: aiQuotaQuery.data.limit }
        : undefined,
      websiteBuilderInstalled,
      websiteBuilderCanOpen: websiteBuilderInstalled,
    }),
    [aiQuotaQuery.data, billingQuery.data, permissions, websiteBuilderInstalled]
  );

  return {
    isLoading:
      authLoading ||
      billingQuery.isLoading ||
      aiQuotaQuery.isLoading ||
      applicationsQuery.isLoading,
    ctx,
    canAccessHub: canAccessLandingHub(ctx),
    canCreatePage: canCreateLandingPage(ctx),
    canCreateAiPage: canCreateAiLandingPage(ctx),
    canCreateDomain: canCreateDomain(ctx),
    canPublishPage: canPublishLandingPage(ctx),
    canUseProTemplate: canUseProTemplate(ctx),
    canApplyTemplate: (template: LandingTemplateTierSource) => canApplyTemplate(ctx, template),
    isProTemplate,
    canUseAdvancedBlocks: canUseAdvancedBuilderBlocks(ctx),
    canAccessDomains: canAccessDomainsTab(ctx),
    canAccessLeads: canAccessLeadsTab(ctx),
    pagesUsed: billingQuery.data?.pages.used ?? 0,
    pagesLimit: billingQuery.data?.pages.limit ?? 0,
    aiGenerationsUsed: aiQuotaQuery.data?.used ?? 0,
    aiGenerationsLimit: aiQuotaQuery.data?.limit ?? 5,
    aiGenerationsRemaining: aiQuotaQuery.data?.remaining ?? 5,
    domainsUsed: billingQuery.data?.domains.used ?? 0,
    domainsLimit: billingQuery.data?.domains.limit ?? 0,
    subscriptionTier: ctx.subscriptionTier,
    refetchAiQuota: aiQuotaQuery.refetch,
  };
}