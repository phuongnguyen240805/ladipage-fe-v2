"use client";

import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CampaignWizardPage from "../create-campaign/components/CampaignWizardPage";
import AdsDraftsPage from "../drafts/components/AdsDraftsPage";
import AdsGuidePage from "../guide/components/AdsGuidePage";
import AdsManagerPage from "../manager/components/AdsManagerPage";
import AdsAccountsPage from "../pages/AdsAccountsPage";
import BusinessManagersPage from "../pages/BusinessManagersPage";
import FanpagesPage from "../pages/FanpagesPage";
import TempEmailPage from "../pages/TempEmailPage";
import AdsPermissionsPage from "../permissions/components/AdsPermissionsPage";
import AdsPolicyPage from "../policy/components/AdsPolicyPage";
import AdsReportsPage from "../reports/components/AdsReportsPage";
import AdsRulesPage from "../rules/components/AdsRulesPage";
import AdsMetaSettingsPage from "../settings/components/AdsMetaSettingsPage";
import AdsSupportPage from "../support/components/AdsSupportPage";
import ToolPreviewPage from "../tools/components/ToolPreviewPage";
import ToolsHubPage from "../tools/components/ToolsHubPage";
import AdsMetaFloatingSupport from "./AdsMetaFloatingSupport";
import AdsMetaHeader from "./AdsMetaHeader";
import AdsMetaNavigationDrawer from "./AdsMetaNavigationDrawer";
import FacebookAdsSurface from "./FacebookAdsSurface";

const DEFAULT_PATH = "/facebook-ads/manager";
const FACEBOOK_ADS_BASE_PATH = "/facebook-ads/";
const EXACT_PREVIEW_PATHS = new Set([
  DEFAULT_PATH,
  "/facebook-ads/create",
  "/facebook-ads/drafts",
  "/facebook-ads/reports",
  "/facebook-ads/rules",
  "/facebook-ads/permissions",
  "/facebook-ads/policy",
  "/facebook-ads/support",
  "/facebook-ads/tools",
  "/facebook-ads/tai-khoan-qc",
  "/facebook-ads/tai-khoan-bm",
  "/facebook-ads/fanpage",
  "/facebook-ads/email-tam-thoi",
  "/facebook-ads/guide",
  "/facebook-ads/cai-dat",
]);

function normalizePreviewPath(path: string | null): string {
  if (!path) return DEFAULT_PATH;

  let normalizedPath = path.trim();
  try {
    normalizedPath = decodeURIComponent(normalizedPath);
  } catch {
    return DEFAULT_PATH;
  }

  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `${FACEBOOK_ADS_BASE_PATH}${normalizedPath.replace(/^\/+/, "")}`;
  }

  normalizedPath = normalizedPath.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  if (EXACT_PREVIEW_PATHS.has(normalizedPath)) return normalizedPath;

  if (normalizedPath.startsWith("/facebook-ads/tools/")) {
    const slug = normalizedPath.slice("/facebook-ads/tools/".length);
    return slug && !slug.includes("/") ? normalizedPath : "/facebook-ads/tools";
  }

  return DEFAULT_PATH;
}

function renderPreviewPage(path: string): ReactNode {
  if (path.startsWith("/facebook-ads/tools/")) {
    return <ToolPreviewPage slug={path.slice("/facebook-ads/tools/".length)} />;
  }

  switch (path) {
    case "/facebook-ads/create":
      return <CampaignWizardPage />;
    case "/facebook-ads/drafts":
      return <AdsDraftsPage />;
    case "/facebook-ads/reports":
      return <AdsReportsPage />;
    case "/facebook-ads/rules":
      return <AdsRulesPage />;
    case "/facebook-ads/permissions":
      return <AdsPermissionsPage />;
    case "/facebook-ads/policy":
      return <AdsPolicyPage />;
    case "/facebook-ads/support":
      return <AdsSupportPage />;
    case "/facebook-ads/tools":
      return <ToolsHubPage />;
    case "/facebook-ads/tai-khoan-qc":
      return <AdsAccountsPage />;
    case "/facebook-ads/tai-khoan-bm":
      return <BusinessManagersPage />;
    case "/facebook-ads/fanpage":
      return <FanpagesPage />;
    case "/facebook-ads/email-tam-thoi":
      return <TempEmailPage />;
    case "/facebook-ads/guide":
      return <AdsGuidePage />;
    case "/facebook-ads/cai-dat":
      return <AdsMetaSettingsPage />;
    default:
      return null;
  }
}

export default function FacebookAdsExtensionPreview() {
  const [activePath, setActivePath] = useState(DEFAULT_PATH);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  useEffect(() => {
    if (!isNavigationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsNavigationOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNavigationOpen]);

  const navigate = useCallback((requestedPath: string) => {
    const nextPath = normalizePreviewPath(requestedPath);
    setActivePath(nextPath);
    setIsNavigationOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleInternalNavigation = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      const href = anchor?.getAttribute("href");
      if (!href?.startsWith(FACEBOOK_ADS_BASE_PATH)) return;

      event.preventDefault();
      navigate(href);
    },
    [navigate],
  );

  const activeContent = useMemo(
    () =>
      activePath === DEFAULT_PATH ? (
        <AdsManagerPage />
      ) : (
        renderPreviewPage(activePath)
      ),
    [activePath],
  );

  const closeNavigation = () => setIsNavigationOpen(false);

  return (
    <FacebookAdsSurface
      variant="extension"
      className="relative"
      onClickCapture={handleInternalNavigation}
    >
      <AdsMetaHeader onOpenMenu={() => setIsNavigationOpen(true)} />

      <div key={activePath} className="min-h-0 flex-1 overflow-auto">
        {activeContent}
      </div>

      <AdsMetaNavigationDrawer
        open={isNavigationOpen}
        pathname={activePath}
        onClose={closeNavigation}
      />
      <AdsMetaFloatingSupport />
    </FacebookAdsSurface>
  );
}
