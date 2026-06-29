import React, { useEffect } from "react";
import { useAiSeoProjects } from "../hooks/useAiSeoProjects";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";
import SeoProjectCard from "./SeoProjectCard";
import SeoProjectFilters from "./SeoProjectFilters";
import SeoProjectPagination from "./SeoProjectPagination";
import EmptySeoProjectState from "./EmptySeoProjectState";
import SeoProjectSkeleton from "./SeoProjectSkeleton";

export function SeoProjectList() {
  const { data: projects = [], isLoading } = useAiSeoProjects();
  const {
    search,
    statusFilter,
    sort,
    activeTab,
    page,
    pageSize,
    setPageSize,
  } = useAiSeoDashboardStore();

  // Load page size from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aiSeoListingPageSize");
      if (saved) {
        setPageSize(Number(saved));
      }
    }
  }, [setPageSize]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeoProjectFilters activeCount={0} frozenCount={0} />
        <SeoProjectSkeleton />
      </div>
    );
  }

  // 1. Calculate counts for active/frozen tabs
  const activeCount = projects.filter((p) => !p.isFrozen).length;
  const frozenCount = projects.filter((p) => p.isFrozen).length;

  // 2. Filter projects based on client selections
  const filtered = projects.filter((p) => {
    // Tab Filter
    const tabMatch = activeTab === "active" ? !p.isFrozen : p.isFrozen;
    if (!tabMatch) return false;

    // Search hostname Filter
    const cleanSearch = search.trim().toLowerCase();
    if (cleanSearch && !p.hostname.toLowerCase().includes(cleanSearch)) {
      return false;
    }

    // Status / Tag Verification state filter
    if (statusFilter !== "all") {
      if (statusFilter === "installed" && p.pixelTagState !== "installed") {
        return false;
      }
      if (
        statusFilter === "not_installed" &&
        p.pixelTagState !== "not_installed"
      ) {
        return false;
      }
      if (statusFilter === "checking" && p.pixelTagState !== "checking") {
        return false;
      }
    }

    return true;
  });

  // 3. Sort projects
  filtered.sort((a, b) => {
    if (sort === "favorites") {
      return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
    }
    if (sort === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === "highest_score") {
      const scoreA = a.scores?.graderScore ?? a.aiGradeOverall ?? 0;
      const scoreB = b.scores?.graderScore ?? b.aiGradeOverall ?? 0;
      return scoreB - scoreA;
    }
    // Default newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 4. Paginate elements
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Filtering tabs and selects header */}
      <SeoProjectFilters activeCount={activeCount} frozenCount={frozenCount} />

      {/* Render paginated list cards */}
      {paginated.length === 0 ? (
        <EmptySeoProjectState />
      ) : (
        <div className="space-y-5">
          {paginated.map((project) => (
            <SeoProjectCard key={project.id} project={project} />
          ))}

          {/* Pagination controls */}
          <SeoProjectPagination totalItems={filtered.length} />
        </div>
      )}
    </div>
  );
}
export default SeoProjectList;
