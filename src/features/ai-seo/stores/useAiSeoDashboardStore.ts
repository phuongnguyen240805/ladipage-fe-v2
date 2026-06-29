import { create } from "zustand";

interface AiSeoDashboardState {
  activeTab: "active" | "deep_frozen";
  search: string;
  statusFilter: string; // 'all' | 'installed' | 'not_installed' | 'checking'
  sort: "newest" | "oldest" | "highest_score" | "favorites";
  page: number;
  pageSize: number;
  selectedProjectId: string | null;
  gscGbpModalType: "gsc" | "gbp" | null;
  gscGbpModalProjectId: string | null;

  setActiveTab: (tab: "active" | "deep_frozen") => void;
  setSearch: (search: string) => void;
  setStatusFilter: (filter: string) => void;
  setSort: (sort: "newest" | "oldest" | "highest_score" | "favorites") => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedProjectId: (id: string | null) => void;
  setGscGbpModal: (type: "gsc" | "gbp" | null, projectId: string | null) => void;
  resetFilters: () => void;
}

export const useAiSeoDashboardStore = create<AiSeoDashboardState>((set) => ({
  activeTab: "active",
  search: "",
  statusFilter: "all",
  sort: "newest",
  page: 1,
  pageSize: 10, // Default page size
  selectedProjectId: null,
  gscGbpModalType: null,
  gscGbpModalProjectId: null,

  setActiveTab: (activeTab) => set({ activeTab, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiSeoListingPageSize", String(pageSize));
    }
    set({ pageSize, page: 1 });
  },
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setGscGbpModal: (type, projectId) =>
    set({ gscGbpModalType: type, gscGbpModalProjectId: projectId }),
  resetFilters: () =>
    set({
      search: "",
      statusFilter: "all",
      sort: "newest",
      page: 1,
    }),
}));
