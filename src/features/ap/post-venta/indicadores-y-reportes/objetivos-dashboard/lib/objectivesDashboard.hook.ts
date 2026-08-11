import { useQuery } from "@tanstack/react-query";
import { getObjectivesDashboard } from "./objectivesDashboard.actions";
import {
  ObjectivesDashboardFilters,
  ObjectivesDashboardResponse,
} from "./objectivesDashboard.interface";

export const OBJECTIVES_DASHBOARD_QUERY_KEY = "objectivesDashboard";

export const useObjectivesDashboard = (filters: ObjectivesDashboardFilters) => {
  return useQuery<ObjectivesDashboardResponse>({
    queryKey: [
      OBJECTIVES_DASHBOARD_QUERY_KEY,
      filters.year,
      filters.month,
      filters.sede_id ?? "all",
    ],
    queryFn: () => getObjectivesDashboard(filters),
    enabled: !!filters.year && !!filters.month,
  });
};
