"use client";

import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import Settings from "@/components/settings/Settings";
import WorkspaceSettings from "@/components/workspace-settings/WorkspaceSettings";
import CampaignWizardPage from "../create-campaign/components/CampaignWizardPage";
import AdsDraftsPage from "../drafts/components/AdsDraftsPage";
import AdsManagerPage from "../manager/components/AdsManagerPage";
import AdsAccountsPage from "../pages/AdsAccountsPage";
import BusinessManagersPage from "../pages/BusinessManagersPage";
import FanpagesPage from "../pages/FanpagesPage";
import TempEmailPage from "../pages/TempEmailPage";
import AdsReportsPage from "../reports/components/AdsReportsPage";
import AdsRulesPage from "../rules/components/AdsRulesPage";
import ToolPreviewPage from "../tools/components/ToolPreviewPage";
import ToolsHubPage from "../tools/components/ToolsHubPage";
import { getAdsTool } from "../tools/tool-catalog";
import FacebookAdsNavigationSidebar from "./FacebookAdsNavigationSidebar";

const DEFAULT_PATH = "/facebook-ads/manager";
const FACEBOOK_ADS_BASE_PATH = "/facebook-ads/";
const EXACT_PREVIEW_PATHS = new Set([
  DEFAULT_PATH,
  "/facebook-ads/create",
  "/facebook-ads/drafts",
  "/facebook-ads/reports",
  "/facebook-ads/rules",
  "/facebook-ads/tools",
  "/facebook-ads/tai-khoan-qc",
  "/facebook-ads/tai-khoan-bm",
  "/facebook-ads/fanpage",
  "/facebook-ads/email-tam-thoi",
  "/facebook-ads/cai-dat",
]);

const previewTitles: Record<string, string> = {
  [DEFAULT_PATH]: "Ads Manager",
  "/facebook-ads/create": "Tạo chiến dịch",
  "/facebook-ads/drafts": "Bản nháp",
  "/facebook-ads/reports": "Báo cáo",
  "/facebook-ads/rules": "Quy tắc tự động",
  "/facebook-ads/tools": "Bộ công cụ",
  "/facebook-ads/tai-khoan-qc": "Tài khoản quảng cáo",
  "/facebook-ads/tai-khoan-bm": "Business Manager",
  "/facebook-ads/fanpage": "Fanpage",
  "/facebook-ads/email-tam-thoi": "Email tạm thời",
  "/facebook-ads/cai-dat": "Cài đặt",
};

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

function FacebookAdsSettingsPreview() {
  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <WorkspaceSettings />
      <Settings />
    </div>
  );
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
    case "/facebook-ads/cai-dat":
      return <FacebookAdsSettingsPreview />;
    default:
      return null;
  }
}

function getPreviewTitle(path: string): string {
  if (path.startsWith("/facebook-ads/tools/")) {
    return getAdsTool(path.slice("/facebook-ads/tools/".length))?.name || "Bộ công cụ";
  }
  return previewTitles[path] || previewTitles[DEFAULT_PATH];
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

  const isAdsManager = activePath === DEFAULT_PATH;
  const activeContent = useMemo(
    () =>
      isAdsManager ? (
        <AdsManagerPage
          navigationOpen={isNavigationOpen}
          onOpenNavigation={() => setIsNavigationOpen(true)}
        />
      ) : (
        renderPreviewPage(activePath)
      ),
    [activePath, isAdsManager, isNavigationOpen],
  );

  const closeNavigation = () => setIsNavigationOpen(false);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-background"
      onClickCapture={handleInternalNavigation}
    >
      {!isAdsManager && (
        <div className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
          <button
            type="button"
            aria-label="Mở menu Facebook Ads"
            aria-expanded={isNavigationOpen}
            onClick={() => setIsNavigationOpen(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu aria-hidden="true" size={17} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {getPreviewTitle(activePath)}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              Facebook Ads · Chế độ extension
            </p>
          </div>
        </div>
      )}

      <div key={activePath}>{activeContent}</div>

      <div
        className={`fixed inset-0 z-[100] transition ${
          isNavigationOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
        aria-hidden={!isNavigationOpen}
      >
        <button
          type="button"
          aria-label="Đóng menu Facebook Ads"
          tabIndex={isNavigationOpen ? 0 : -1}
          onClick={closeNavigation}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-200 ${
            isNavigationOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <FacebookAdsNavigationSidebar
          pathname={activePath}
          variant="drawer"
          onNavigate={closeNavigation}
          onClose={closeNavigation}
          className={`absolute inset-y-0 left-0 w-64 border-r shadow-2xl transition-transform duration-200 ease-out ${
            isNavigationOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />
      </div>
    </div>
  );
}