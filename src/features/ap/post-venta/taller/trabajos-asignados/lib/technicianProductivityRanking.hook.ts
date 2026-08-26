import { useQuery } from "@tanstack/react-query";
import { getTechnicianProductivityRanking } from "./technicianProductivityRanking.actions";
import {
  TechnicianProductivityRankingFilters,
  TechnicianProductivityRankingResponse,
} from "./technicianProductivityRanking.interface";

export const TECHNICIAN_PRODUCTIVITY_RANKING_QUERY_KEY =
  "technicianProductivityRanking";

export const useTechnicianProductivityRanking = (
  filters: TechnicianProductivityRankingFilters | null,
  enabled: boolean,
) => {
  return useQuery<TechnicianProductivityRankingResponse>({
    queryKey: [
      TECHNICIAN_PRODUCTIVITY_RANKING_QUERY_KEY,
      filters?.date_range?.[0],
      filters?.date_range?.[1],
      filters?.sede_id,
    ],
    queryFn: () => getTechnicianProductivityRanking(filters!),
    enabled: enabled && !!filters?.sede_id,
  });
};
