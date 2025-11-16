import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CommercialFiltersState {
  selectedAdvisorId?: number;
  setSelectedAdvisorId: (advisorId: number | undefined) => void;
  clearFilters: () => void;
}

/**
 * Store for managing commercial module filters across different pages
 * This allows filters to persist when navigating between agenda and opportunities pages
 */
export const useCommercialFiltersStore = create<CommercialFiltersState>()(
  persist(
    (set) => ({
      selectedAdvisorId: undefined,
      setSelectedAdvisorId: (advisorId) => set({ selectedAdvisorId: advisorId }),
      clearFilters: () => set({ selectedAdvisorId: undefined }),
    }),
    {
      name: "commercial-filters-storage", // localStorage key
    }
  )
);
