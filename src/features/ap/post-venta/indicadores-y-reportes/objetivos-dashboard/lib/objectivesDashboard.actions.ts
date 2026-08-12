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

export async function exportObjectivesDashboard(
  filters: ObjectivesDashboardFilters,
): Promise<void> {
  const response = await api.post(
    `${BASE_ENDPOINT}/export`,
    {
      year: filters.year,
      month: filters.month,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
    { responseType: "blob" },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `dashboard-objetivos-${filters.year}-${filters.month}.xlsx`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
