import { useQuery } from "@tanstack/react-query";
import { getTechnicianProductivityDetail } from "./technicianProductivity.actions";
import {
  TechnicianProductivityFilters,
  TechnicianProductivityResponse,
} from "./technicianProductivity.interface";

export const TECHNICIAN_PRODUCTIVITY_QUERY_KEY = "technicianProductivity";

export const useTechnicianProductivity = (
  filters: TechnicianProductivityFilters | null,
) => {
  return useQuery<TechnicianProductivityResponse>({
    queryKey: [
      TECHNICIAN_PRODUCTIVITY_QUERY_KEY,
      filters?.worker_id,
      filters?.date_range?.[0],
      filters?.date_range?.[1],
      filters?.sede_id ?? "all",
    ],
    queryFn: () => getTechnicianProductivityDetail(filters!),
    enabled: !!filters?.worker_id,
  });
};
