import { AxiosRequestConfig } from "axios";
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
  try {
    const isPDF = filters.format === "pdf";

    const config: AxiosRequestConfig = {
      params: {
        created_at: [filters.date_from, filters.date_to],
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

    link.download = `dashboard-${dateRange}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}
