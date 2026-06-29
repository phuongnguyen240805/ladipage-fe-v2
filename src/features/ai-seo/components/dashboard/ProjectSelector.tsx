import React, { useEffect } from "react";
import { FolderKanban, ChevronDown } from "lucide-react";
import { useProjectsQuery } from "../../hooks/useProjectQueries";
import { useSeoProjectsQuery } from "../../hooks/useSeoProjectQueries";
import { useAiSeoUiStore } from "../../stores/useAiSeoUiStore";

export function ProjectSelector() {
  const {
    selectedOrgId,
    selectedProjectId,
    setSelectedProjectId,
    setSelectedSeoProjectId
  } = useAiSeoUiStore();

  const { data: projects = [], isLoading } = useProjectsQuery(selectedOrgId);
  const { data: seoProjects = [] } = useSeoProjectsQuery(selectedOrgId);

  const firstProjectId = projects[0]?.id || null;
  const matchedSeoProject = selectedProjectId
    ? seoProjects.find((sp) => sp.project_id === selectedProjectId || (sp as any).projectId === selectedProjectId)
    : null;
  const matchedSeoProjectId = matchedSeoProject ? matchedSeoProject.id : null;

  // Automatically select the first project if none is active
  useEffect(() => {
    if (firstProjectId && !selectedProjectId) {
      setSelectedProjectId(firstProjectId);
    }
  }, [firstProjectId, selectedProjectId, setSelectedProjectId]);

  // Synchronize SEO Project metadata when project changes
  useEffect(() => {
    setSelectedSeoProjectId(matchedSeoProjectId);
  }, [matchedSeoProjectId, setSelectedSeoProjectId]);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  if (isLoading) {
    return (
      <div className="h-9 w-44 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-800" />
    );
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <FolderKanban className="w-4 h-4 text-blue-500 shrink-0" />
        <select
          value={selectedProjectId || ""}
          onChange={(e) => setSelectedProjectId(e.target.value || null)}
          className="appearance-none pr-8 pl-1 py-1.5 bg-transparent border-0 font-bold text-sm text-gray-850 dark:text-white focus:outline-none focus:ring-0 cursor-pointer"
        >
          {projects.length === 0 ? (
            <option value="">Không có dự án</option>
          ) : (
            projects.map((proj) => (
              <option key={proj.id} value={proj.id} className="text-gray-800 dark:text-gray-200 bg-white dark:bg-[#1a1a26]">
                {proj.name}
              </option>
            ))
          )}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 -ml-6 pointer-events-none" />
      </div>
    </div>
  );
}
export default ProjectSelector;
