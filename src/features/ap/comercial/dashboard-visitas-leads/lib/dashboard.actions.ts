import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  IndicatorsByDateRangeResponse,
  IndicatorsBySedeResponse,
  IndicatorsBySedeAndBrandResponse,
  IndicatorsByAdvisorResponse,
  DashboardFilters,
  IndicatorsByDateTotalRange,
  IndicatorsByDateRange,
  IndicatorsByUser,
  IndicatorsByCampaign,
} from "./dashboard.interface";

const BASE_ENDPOINT = "/ap/commercial/dashboard-visit-leads";

export async function getIndicatorsByDateTotalRange(
  filters: DashboardFilters
): Promise<IndicatorsByDateRangeResponse<IndicatorsByDateTotalRange>> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<
    IndicatorsByDateRangeResponse<IndicatorsByDateTotalRange>
  >(`${BASE_ENDPOINT}/by-date-range-total`, config);
  return data;
}

export async function getIndicatorsByDateRange(
  filters: DashboardFilters
): Promise<IndicatorsByDateRangeResponse<IndicatorsByDateRange[]>> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<
    IndicatorsByDateRangeResponse<IndicatorsByDateRange[]>
  >(`${BASE_ENDPOINT}/by-date-range`, config);
  return data;
}

export async function getIndicatorsBySede(
  filters: DashboardFilters
): Promise<IndicatorsBySedeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<IndicatorsBySedeResponse>(
    `${BASE_ENDPOINT}/by-sede`,
    config
  );
  return data;
}

export async function getIndicatorsBySedeAndBrand(
  filters: DashboardFilters
): Promise<IndicatorsBySedeAndBrandResponse> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<IndicatorsBySedeAndBrandResponse>(
    `${BASE_ENDPOINT}/by-sede-and-brand`,
    config
  );
  return data;
}

export async function getIndicatorsByAdvisor(
  filters: DashboardFilters
): Promise<IndicatorsByAdvisorResponse> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<IndicatorsByAdvisorResponse>(
    `${BASE_ENDPOINT}/by-advisor`,
    config
  );
  return data;
}

export async function getIndicatorsByUser(
  filters: DashboardFilters
): Promise<IndicatorsByDateRangeResponse<IndicatorsByUser[]>> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<
    IndicatorsByDateRangeResponse<IndicatorsByUser[]>
  >(`${BASE_ENDPOINT}/by-user`, config);
  return data;
}

export async function getIndicatorsByCampaign(
  filters: DashboardFilters
): Promise<IndicatorsByDateRangeResponse<IndicatorsByCampaign[]>> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
    },
  };

  const { data } = await api.get<
    IndicatorsByDateRangeResponse<IndicatorsByCampaign[]>
  >(`${BASE_ENDPOINT}/by-campaign`, config);
  return data;
}

export async function downloadDashboardFile(
  filters: DashboardFilters & { format?: "pdf" }
): Promise<void> {
  const isPDF = filters.format === "pdf";

  const config: AxiosRequestConfig = {
    params: {
      type: filters.type,
      registration_date: [filters.date_from, filters.date_to],
      ...(isPDF && { format: "pdf" }),
    },
    responseType: "blob",
  };

  const response = await api.get(
    "/ap/commercial/potentialBuyers/export",
    config
  );

  // Determinar el tipo MIME y extensión según el formato
  const mimeType = isPDF
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const extension = isPDF ? "pdf" : "xlsx";

  const blob = new Blob([response.data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Generar nombre de archivo con fechas y tipo
  const dateRange = `${filters.date_from}_${filters.date_to}`;

  link.download = `REPORTE-${filters.type}-${dateRange}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Sales Manager Dashboard Actions
export async function getSalesManagerStats(
  filters: import("./dashboard.interface").SalesManagerFilters
): Promise<import("./dashboard.interface").SalesManagerStatsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
      ...(filters.boss_id && { boss_id: filters.boss_id }),
    },
  };

  const { data } = await api.get<
    import("./dashboard.interface").SalesManagerStatsResponse
  >(`${BASE_ENDPOINT}/for-sales-manager-stats`, config);
  return data;
}

export async function getSalesManagerDetails(
  filters: import("./dashboard.interface").SalesManagerDetailsFilters
): Promise<import("./dashboard.interface").SalesManagerDetailsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      date_from: filters.date_from,
      date_to: filters.date_to,
      type: filters.type,
      ...(filters.boss_id && { boss_id: filters.boss_id }),
      ...(filters.per_page && { per_page: filters.per_page }),
      ...(filters.worker_id && { worker_id: filters.worker_id }),
      ...(filters.page && { page: filters.page }),
    },
  };

  const { data } = await api.get<
    import("./dashboard.interface").SalesManagerDetailsResponse
  >(`${BASE_ENDPOINT}/for-sales-manager-details`, config);
  return data;
}
