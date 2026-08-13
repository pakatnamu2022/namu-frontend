import { useQuery } from "@tanstack/react-query";
import { getProductivityDashboard } from "./productivityDashboard.actions";
import {
  ProductivityDashboardFilters,
  ProductivityDashboardResponse,
} from "./productivityDashboard.interface";

export const PRODUCTIVITY_DASHBOARD_QUERY_KEY = "productivityDashboard";

export const useProductivityDashboard = (
  filters: ProductivityDashboardFilters,
) => {
  return useQuery<ProductivityDashboardResponse>({
    queryKey: [
      PRODUCTIVITY_DASHBOARD_QUERY_KEY,
      filters.year,
      filters.month,
      filters.sede_id ?? "all",
    ],
    queryFn: () => getProductivityDashboard(filters),
    enabled: !!filters.year && !!filters.month,
  });
};
