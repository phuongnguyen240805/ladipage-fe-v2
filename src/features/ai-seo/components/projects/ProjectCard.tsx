import React from "react";
import Link from "next/link";
import { Project, SeoProject } from "../../types";
import { FolderKanban, Globe, ChevronRight, Settings } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  seoProject?: SeoProject;
  onSelect: (id: string) => void;
  isActive: boolean;
}

export function ProjectCard({ project, seoProject, onSelect, isActive }: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(project.id)}
      className={`bg-white dark:bg-[#1e1e2d] border rounded-2xl p-5 cursor-pointer transition shadow-sm hover:shadow relative group flex flex-col justify-between h-44 ${
        isActive
          ? "border-blue-500 ring-2 ring-blue-500/10 dark:border-blue-600"
          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FolderKanban className="w-4.5 h-4.5" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400"
          }`}>
            {isActive ? "Đang chọn" : "Dự án"}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h4 className="text-sm font-extrabold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.name}
          </h4>
          
          {/* Domain name info */}
          {seoProject ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              {seoProject.domain}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-550 mt-1 italic">
              Chưa thiết lập tên miền
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-gray-150 dark:border-gray-850 flex items-center justify-between">
        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono uppercase">
          ID: {project.id.slice(0, 8)}
        </span>
        <Link
          href={`/ai-seo/projects/${project.id}/tasks`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-bold text-blue-600 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-0.5"
        >
          Task Board
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
export default ProjectCard;
