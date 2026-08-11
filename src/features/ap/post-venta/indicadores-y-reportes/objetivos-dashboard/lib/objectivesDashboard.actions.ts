import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  ObjectivesDashboardFilters,
  ObjectivesDashboardResponse,
} from "./objectivesDashboard.interface";

const BASE_ENDPOINT = "/ap/postVenta/reports/objectives/dashboard";

export async function getObjectivesDashboard(
  filters: ObjectivesDashboardFilters,
): Promise<ObjectivesDashboardResponse> {
  const config: AxiosRequestConfig = {
    params: {
      year: filters.year,
      month: filters.month,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
      ...(filters.use_cache !== undefined && { use_cache: filters.use_cache }),
    },
  };

  const { data } = await api.get<ObjectivesDashboardResponse>(
    BASE_ENDPOINT,
    config,
  );
  return data;
}

export async function refreshObjectivesDashboard(
  filters: ObjectivesDashboardFilters,
): Promise<ObjectivesDashboardResponse> {
  const { data } = await api.post<ObjectivesDashboardResponse>(
    `${BASE_ENDPOINT}/refresh`,
    {
      year: filters.year,
      month: filters.month,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  );
  return data;
}
