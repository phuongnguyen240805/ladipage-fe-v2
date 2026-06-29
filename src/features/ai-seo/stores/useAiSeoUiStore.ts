import { create } from "zustand";

interface AiSeoUiState {
  selectedOrgId: string;
  selectedProjectId: string | null;
  selectedSeoProjectId: string | null;
  taskFilterImportance: "all" | "high" | "medium" | "low";
  activeJobId: string | null;

  setSelectedOrgId: (id: string) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedSeoProjectId: (id: string | null) => void;
  setTaskFilterImportance: (importance: "all" | "high" | "medium" | "low") => void;
  setActiveJobId: (jobId: string | null) => void;
}

export const useAiSeoUiStore = create<AiSeoUiState>((set) => ({
  selectedOrgId: "org-1", // Predefined default demo organization
  selectedProjectId: null,
  selectedSeoProjectId: null,
  taskFilterImportance: "all",
  activeJobId: null,

  setSelectedOrgId: (id) => set((state) => {
    if (state.selectedOrgId === id) return {};
    return { selectedOrgId: id, selectedProjectId: null, selectedSeoProjectId: null };
  }),
  setSelectedProjectId: (id) => set((state) => {
    if (state.selectedProjectId === id) return {};
    return { selectedProjectId: id };
  }),
  setSelectedSeoProjectId: (id) => set((state) => {
    if (state.selectedSeoProjectId === id) return {};
    return { selectedSeoProjectId: id };
  }),
  setTaskFilterImportance: (importance) => set((state) => {
    if (state.taskFilterImportance === importance) return {};
    return { taskFilterImportance: importance };
  }),
  setActiveJobId: (jobId) => set((state) => {
    if (state.activeJobId === jobId) return {};
    return { activeJobId: jobId };
  }),
}));
