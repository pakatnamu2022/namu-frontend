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
 * Get current date in YYYY-MM-DD format
 */
const getCurrentDate = () => new Date().toISOString().split("T")[0];

/**
 * Validate if a date string is reasonable (not too far in past, not in future)
 * Returns the date if valid, otherwise returns current date
 */
const validateDate = (dateStr: string | null): string => {
  if (!dateStr) return getCurrentDate();

  try {
    const date = new Date(dateStr);
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // If date is more than 1 year old or more than 1 day in the future, reset to current date
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(now.getDate() + 1);

    if (date < oneYearAgo || date > oneDayFromNow) {
      return getCurrentDate();
    }

    return dateStr;
  } catch {
    return getCurrentDate();
  }
};

/**
 * Store for managing commercial module filters across different pages
 * This allows filters to persist when navigating between agenda and opportunities pages
 */
export const useCommercialFiltersStore = create<CommercialFiltersState>()(
  persist(
    (set) => ({
      selectedAdvisorId: undefined,
      selectedDate: getCurrentDate(),
      setSelectedAdvisorId: (advisorId) =>
        set({ selectedAdvisorId: advisorId }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      clearFilters: () =>
        set({
          selectedAdvisorId: undefined,
          selectedDate: getCurrentDate(),
        }),
    }),
    {
      name: "commercial-filters-storage", // localStorage key
      version: 1,
      // Validate and migrate old dates on hydration
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || !version) {
          // Migrate from version 0 to 1: validate date
          return {
            ...persistedState,
            selectedDate: validateDate(persistedState?.selectedDate),
          };
        }
        return persistedState;
      },
    }
  )
);
