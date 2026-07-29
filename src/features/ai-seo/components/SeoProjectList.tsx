import React, { useEffect } from "react";
import { useDashboardProjects } from "../hooks/useDashboardProjects";
import { useAiSeoDashboardStore } from "../stores/useAiSeoDashboardStore";
import SeoProjectCompactCard from "./SeoProjectCompactCard";
import SeoProjectFilters from "./SeoProjectFilters";
import SeoProjectPagination from "./SeoProjectPagination";
import EmptySeoProjectState from "./EmptySeoProjectState";
import SeoProjectSkeleton from "./SeoProjectSkeleton";

export function SeoProjectList() {
  const {
    search,
    statusFilter,
    sort,
    page,
    setPage,
    resetFilters,
  } = useAiSeoDashboardStore();
  const dashboardStatus =
    statusFilter === "scanning" || statusFilter === "not_installed" || statusFilter === "ready"
      ? statusFilter
      : "all";
  const dashboardSort =
    sort === "oldest"
      ? "updated_asc"
      : sort === "favorites"
        ? "favorites"
        : "updated_desc";
  const { data, isLoading, isFetching, isError, refetch } = useDashboardProjects({
    page,
    search,
    status: dashboardStatus,
    sort: dashboardSort,
  });
  const projects = data?.items ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (pagination && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination, setPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeoProjectFilters />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <SeoProjectSkeleton key={item} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SeoProjectFilters />

      {isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-10 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            Không thể tải dashboard AI‑SEO.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:text-rose-300"
          >
            Thử lại
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div>
          <EmptySeoProjectState />
          {(search || statusFilter !== "all") && (
            <div className="-mt-6 text-center">
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-lime-700 underline underline-offset-4 dark:text-lime-300"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${isFetching ? "opacity-80" : ""}`}>
            {projects.map((project) => (
              <SeoProjectCompactCard key={project.id} project={project} />
            ))}
          </div>
          <SeoProjectPagination totalItems={pagination?.totalItems ?? projects.length} />
        </>
      )}
    </div>
  );
}
export default SeoProjectList;
