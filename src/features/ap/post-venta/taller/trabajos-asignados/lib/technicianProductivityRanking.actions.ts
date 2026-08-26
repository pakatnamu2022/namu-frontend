import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  TechnicianProductivityRankingFilters,
  TechnicianProductivityRankingResponse,
} from "./technicianProductivityRanking.interface";

const RANKING_ENDPOINT = "/ap/postVenta/dashboard/productivity/technician-detail";

export async function getTechnicianProductivityRanking(
  filters: TechnicianProductivityRankingFilters,
): Promise<TechnicianProductivityRankingResponse> {
  const config: AxiosRequestConfig = {
    params: {
      date_range: filters.date_range,
      sede_id: filters.sede_id,
      ...(filters.use_cache !== undefined && { use_cache: filters.use_cache }),
    },
  };

  const { data } = await api.get<TechnicianProductivityRankingResponse>(
    RANKING_ENDPOINT,
    config,
  );
  return data;
}
