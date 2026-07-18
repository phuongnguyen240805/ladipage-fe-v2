import React from "react";
import Link from "next/link";
import { FolderKanban, PlusCircle, AlertCircle, Loader2 } from "lucide-react";
import { useProjectsQuery } from "../../hooks/useProjectQueries";
import { useSeoProjectsQuery } from "../../hooks/useSeoProjectQueries";
import { useAiSeoUiStore } from "../../stores/useAiSeoUiStore";
import ProjectCard from "./ProjectCard";

export function ProjectList() {
  const { selectedOrgId, selectedProjectId, setSelectedProjectId } = useAiSeoUiStore();

  const { data: projects = [], isLoading: isLoadingProjects } = useProjectsQuery(selectedOrgId);
  const { data: seoProjects = [], isLoading: isLoadingSeo } = useSeoProjectsQuery(selectedOrgId);

  const isLoading = isLoadingProjects || isLoadingSeo;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-650">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <span className="text-sm">Đang tải danh sách dự án...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto space-y-4">
        <FolderKanban className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-gray-850 dark:text-white">Không có dự án SEO nào</h3>
          <p className="text-xs text-gray-500 dark:text-gray-450 max-w-xs mx-auto leading-normal">
            Bạn chưa tạo dự án nào. Tạo dự án đầu tiên để cấu hình và quét các chỉ số chuẩn SEO.
          </p>
        </div>
        <Link
          href="/ai-seo/projects/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Tạo dự án mới
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-850 dark:text-white flex items-center gap-2">
          <FolderKanban className="w-4.5 h-4.5 text-blue-500" />
          Danh sách dự án hoạt động ({projects.length})
        </h3>
        <Link
          href="/ai-seo/projects/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Thêm dự án
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const matchedSeo = seoProjects.find(
            (sp) =>
              sp.projectId === proj.id ||
              (sp as { project_id?: string }).project_id === proj.id,
          );
          const isSelected = selectedProjectId === proj.id;
          const projectForCard = {
            id: proj.id,
            organization_id:
              "organization_id" in proj
                ? String(proj.organization_id ?? "")
                : "organizationId" in proj
                  ? String(proj.organizationId ?? "")
                  : "",
            name:
              "name" in proj && proj.name
                ? String(proj.name)
                : "domain" in proj
                  ? String(proj.domain)
                  : proj.id,
            created_at:
              "created_at" in proj && proj.created_at
                ? String(proj.created_at)
                : "",
            updated_at:
              "updated_at" in proj && proj.updated_at
                ? String(proj.updated_at)
                : "",
          };
          const seoForCard = matchedSeo
            ? {
                id: matchedSeo.id,
                project_id: matchedSeo.projectId,
                domain: matchedSeo.domain,
                gsc_connected: matchedSeo.gscConnected,
                ga_connected: false,
                created_at: "",
                updated_at: "",
              }
            : undefined;

          return (
            <ProjectCard
              key={proj.id}
              project={projectForCard}
              seoProject={seoForCard}
              isActive={isSelected}
              onSelect={setSelectedProjectId}
            />
          );
        })}
      </div>
    </div>
  );
}
export default ProjectList;
