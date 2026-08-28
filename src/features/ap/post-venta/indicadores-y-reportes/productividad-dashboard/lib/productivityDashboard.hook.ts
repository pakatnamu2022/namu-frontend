import { useQuery } from "@tanstack/react-query";
import {
  getProductivityDashboard,
  getProductivityTechnicianDetail,
} from "./productivityDashboard.actions";
import {
  ProductivityDashboardFilters,
  ProductivityDashboardResponse,
  ProductivityTechnicianDetailFilters,
  ProductivityTechnicianDetailResponse,
} from "./productivityDashboard.interface";

export const PRODUCTIVITY_DASHBOARD_QUERY_KEY = "productivityDashboard";
export const PRODUCTIVITY_TECHNICIAN_DETAIL_QUERY_KEY =
  "productivityTechnicianDetail";

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

export const useProductivityTechnicianDetail = (
  filters: ProductivityTechnicianDetailFilters | null,
) => {
  return useQuery<ProductivityTechnicianDetailResponse>({
    queryKey: [
      PRODUCTIVITY_TECHNICIAN_DETAIL_QUERY_KEY,
      filters?.worker_id,
      filters?.date_range?.[0],
      filters?.date_range?.[1],
      filters?.sede_id ?? "all",
    ],
    queryFn: () => getProductivityTechnicianDetail(filters!),
    enabled: !!filters?.worker_id,
  });
};
