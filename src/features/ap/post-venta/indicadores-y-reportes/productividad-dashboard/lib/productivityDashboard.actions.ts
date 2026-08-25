import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  ProductivityDashboardFilters,
  ProductivityDashboardResponse,
  ProductivityTechnicianDetailFilters,
  ProductivityTechnicianDetailResponse,
} from "./productivityDashboard.interface";

const BASE_ENDPOINT = "/ap/postVenta/dashboard/productivity";
const DETAIL_ENDPOINT =
  "/ap/postVenta/dashboard/technician-productivity-detail";

export function toDateRange(year: number, month: number): [string, string] {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return [`${year}-${pad(month)}-01`, `${year}-${pad(month)}-${pad(lastDay)}`];
}

function buildPayload(filters: ProductivityDashboardFilters) {
  return {
    date_range: toDateRange(filters.year, filters.month),
    ...(filters.sede_id && { sede_id: filters.sede_id }),
    ...(filters.use_cache !== undefined && { use_cache: filters.use_cache }),
  };
}

export async function getProductivityDashboard(
  filters: ProductivityDashboardFilters,
): Promise<ProductivityDashboardResponse> {
  const config: AxiosRequestConfig = {
    params: buildPayload(filters),
  };

  const { data } = await api.get<ProductivityDashboardResponse>(
    BASE_ENDPOINT,
    config,
  );
  return data;
}

export async function refreshProductivityDashboard(
  filters: ProductivityDashboardFilters,
): Promise<ProductivityDashboardResponse> {
  const { data } = await api.post<ProductivityDashboardResponse>(
    `${BASE_ENDPOINT}/refresh`,
    buildPayload(filters),
  );
  return data;
}

export async function getProductivityTechnicianDetail(
  filters: ProductivityTechnicianDetailFilters,
): Promise<ProductivityTechnicianDetailResponse> {
  const config: AxiosRequestConfig = {
    params: {
      worker_id: filters.worker_id,
      date_range: filters.date_range,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  };

  const { data } = await api.get<ProductivityTechnicianDetailResponse>(
    DETAIL_ENDPOINT,
    config,
  );
  return data;
}

export async function exportProductivityDashboard(
  filters: ProductivityDashboardFilters,
): Promise<void> {
  const response = await api.post(
    "/ap/postVenta/reports/closed-work-order-billed-hours/export",
    {
      format: "excel",
      date_range: toDateRange(filters.year, filters.month),
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
    { responseType: "blob" },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `reporte-horas-trabajadas-por-sede-${filters.year}-${filters.month}.xlsx`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
