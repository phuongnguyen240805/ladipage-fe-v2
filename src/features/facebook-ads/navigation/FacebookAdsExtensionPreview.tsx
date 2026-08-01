"use client";

import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import FacebookAdsAssetsPage from "../assets/components/FacebookAdsAssetsPage";
import FacebookAdsConnectionsPage from "../connections/components/FacebookAdsConnectionsPage";
import type { FacebookAdsScenarioId } from "../contracts/runtime";
import {
  DEFAULT_FACEBOOK_ADS_SCENARIO,
  isFacebookAdsScenarioId,
} from "../dev-fixtures/scenarios";
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
import FacebookAdsDevToolbar from "./FacebookAdsDevToolbar";
import {
  DEFAULT_FACEBOOK_ADS_PATH as DEFAULT_PATH,
  FACEBOOK_ADS_BASE_PATH,
  normalizeFacebookAdsPreviewPath as normalizePreviewPath,
} from "./preview-routing";

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
    case "/facebook-ads/connections":
      return <FacebookAdsConnectionsPage />;
    case "/facebook-ads/assets":
      return <FacebookAdsAssetsPage />;
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
  const [scenario, setScenario] = useState<FacebookAdsScenarioId>(DEFAULT_FACEBOOK_ADS_SCENARIO);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  useEffect(() => {
    if (!isNavigationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsNavigationOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isNavigationOpen]);

  useEffect(() => {
    const syncFromHistory = () => {
      const params = new URLSearchParams(window.location.search);
      setActivePath(normalizePreviewPath(params.get("path")));
      const requestedScenario = params.get("scenario");
      setScenario(
        isFacebookAdsScenarioId(requestedScenario)
          ? requestedScenario
          : DEFAULT_FACEBOOK_ADS_SCENARIO,
      );
    };
    syncFromHistory();
    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  const updatePreviewUrl = useCallback((path: string, nextScenario: FacebookAdsScenarioId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("path", path);
    url.searchParams.set("scenario", nextScenario);
    window.history.pushState({ path, scenario: nextScenario }, "", url);
  }, []);

  const navigate = useCallback((requestedPath: string) => {
    const nextPath = normalizePreviewPath(requestedPath);
    setActivePath(nextPath);
    setIsNavigationOpen(false);
    updatePreviewUrl(nextPath, scenario);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [scenario, updatePreviewUrl]);

  const changeScenario = useCallback((nextScenario: FacebookAdsScenarioId) => {
    setScenario(nextScenario);
    updatePreviewUrl(activePath, nextScenario);
  }, [activePath, updatePreviewUrl]);

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
      surface="dev-preview"
      scenario={scenario}
      className="relative"
      onClickCapture={handleInternalNavigation}
    >
      <AdsMetaHeader onOpenMenu={() => setIsNavigationOpen(true)} />
      <FacebookAdsDevToolbar scenario={scenario} onScenarioChange={changeScenario} />

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
