import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CommercialFiltersState {
  selectedAdvisorId?: number;
  selectedDate: string | null;
  setSelectedAdvisorId: (advisorId: number | undefined) => void;
  setSelectedDate: (date: string | null) => void;
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
      selectedDate: new Date().toISOString().split("T")[0],
      setSelectedAdvisorId: (advisorId) => set({ selectedAdvisorId: advisorId }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      clearFilters: () => set({
        selectedAdvisorId: undefined,
        selectedDate: new Date().toISOString().split("T")[0]
      }),
    }),
    {
      name: "commercial-filters-storage", // localStorage key
    }
  )
);
