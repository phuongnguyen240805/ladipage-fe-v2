import React from "react";
import { Star, Link2 } from "lucide-react";
import Link from "next/link";
import { AiSeoProjectListItem } from "../types";
import { useAiSeoProjectMutations } from "../hooks/useAiSeoProjectMutations";
import { useConnectedLandingPagesQuery } from "../hooks/useLandingPageQueries";
import { useAiSeoOrgId } from "../hooks/useAiSeoOrgId";
import SeoProjectWarningBanner from "./SeoProjectWarningBanner";
import SeoProjectIntegrationIcons from "./SeoProjectIntegrationIcons";
import SeoProjectInstallStatus from "./SeoProjectInstallStatus";
import SeoProjectScanButton from "./SeoProjectScanButton";
import SeoProjectAgentToggle from "./SeoProjectAgentToggle";
import SeoProjectScoreCards from "./SeoProjectScoreCards";
import ProjectActionsMenu from "./ProjectActionsMenu";

interface SeoProjectCardProps {
  project: AiSeoProjectListItem;
}

export function SeoProjectCard({ project }: SeoProjectCardProps) {
  const routeProjectId = project.projectId || project.id;
  const agentStatus =
    project.agentStatus ??
    ((project as { isEngaged?: boolean }).isEngaged === false ? "disengaged" : "engaged");
  const { favoriteMutation } = useAiSeoProjectMutations();

  const isFavoriteLoading =
    favoriteMutation.isPending && favoriteMutation.variables === routeProjectId;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavoriteLoading) return;
    favoriteMutation.mutate(routeProjectId);
  };

  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${project.hostname}`;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs hover:shadow-theme-md transition duration-200 flex flex-col gap-4 text-slate-800 dark:text-gray-100">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Favorite Toggle Star */}
          <button
            onClick={handleFavoriteClick}
            disabled={isFavoriteLoading}
            className="text-slate-350 hover:text-amber-500 dark:text-slate-650 transition shrink-0 cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                project.isFavorite
                  ? "fill-amber-450 text-amber-450"
                  : "text-slate-300 dark:text-slate-700"
              }`}
            />
          </button>

          {/* Favicon & Hostname details */}
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <img
              src={faviconUrl}
              alt={project.hostname}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex flex-col text-left min-w-0">
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate tracking-tight">
              {project.hostname}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide leading-none mt-0.5">
              {project.pixelTagState === "installed"
                ? "Đã xác thực"
                : "Cần xử lý"}
            </span>
          </div>
        </div>

        {/* Slider, Install Badge, Actions */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          {/* Auto Optimizations Toggle */}
          <SeoProjectAgentToggle
            projectId={routeProjectId}
            agentStatus={agentStatus}
          />

          {/* Script Installation status badge */}
          <SeoProjectInstallStatus status={project.pixelTagState} />

          {/* Project dropdown actions menu */}
          <ProjectActionsMenu
            projectId={routeProjectId}
            readyForProcessing={project.readyForProcessing}
            pixelTagState={project.pixelTagState}
          />
        </div>
      </div>

      {/* Wipe/Installation warnings display */}
      <SeoProjectWarningBanner
        projectId={routeProjectId}
        pixelTagState={project.pixelTagState}
        atRiskOfWipe={project.atRiskOfWipe}
        daysUntilWipe={project.daysUntilWipe}
        wipeScheduledAt={project.wipeScheduledAt}
      />

      {/* Integrations & Manual Scans */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-4 gap-4">
        <SeoProjectIntegrationIcons
          projectId={routeProjectId}
          gscConnected={
            !!(project.gscConnected || project.connectedData?.isGscConnected)
          }
          gbpConnected={
            !!(project.gbpConnected || project.connectedData?.isGbpConnected)
          }
          detectedCms={project.detectedCms}
        />

        <SeoProjectScanButton
          projectId={routeProjectId}
          taskStatus={project.taskStatus}
        />
      </div>

      {/* Landing Pages Integration stats */}
      <ProjectLandingPagesStats projectId={routeProjectId} />

      {/* Scorecards */}
      <div className="border-t border-gray-100 dark:border-gray-800/80 pt-1">
        <SeoProjectScoreCards
          scores={
            project.scores || {
              healthyPages: project.afterSummary?.healthyPages || 0,
              totalPages: project.afterSummary?.totalPages || 0,
              graderScore: project.aiGradeOverall || 0,
              contentScore: project.holisticScores?.contentScore || 0,
              authorityScore: project.holisticScores?.authorityScore || 0,
              technicalScore: project.holisticScores?.technicalsScore || 0,
              uxScore: project.holisticScores?.uxScore || 0,
            }
          }
          readyForProcessing={project.readyForProcessing}
        />
      </div>
    </div>
  );
}

function ProjectLandingPagesStats({ projectId }: { projectId: string }) {
  const orgId = useAiSeoOrgId();
  const { data: connectedPages } = useConnectedLandingPagesQuery(orgId, projectId);
  const pagesCount = connectedPages?.length || 0;
  const publishedPagesCount = connectedPages?.filter(p => p.scanStatus === "completed" || p.graderScore > 0).length || 0;

  return (
    <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
        <Link2 className="w-4.5 h-4.5 text-slate-400 dark:text-slate-650" />
        <span>Landing Pages:</span>
        <span className="font-semibold text-slate-900 dark:text-white">{pagesCount} liên kết</span>
        {pagesCount > 0 && (
          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-350 px-1.5 py-0.5 rounded font-bold">
            {publishedPagesCount} đã quét
          </span>
        )}
      </div>
      <Link
        href={`/ai-seo/projects/${projectId}/landing-pages`}
        className="text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold transition flex items-center gap-1 underline decoration-dotted underline-offset-2"
      >
        Xem trang Landing Page →
      </Link>
    </div>
  );
}

export default SeoProjectCard;
