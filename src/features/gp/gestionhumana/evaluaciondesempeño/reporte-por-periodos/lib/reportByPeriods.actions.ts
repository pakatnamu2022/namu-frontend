import { api } from "@/core/api";
import {
  ReportByPeriodsApiResponse,
  ReportByPeriodsRequest,
  ReportByPeriodsResponse,
  ReportByPeriodsRow,
} from "./reportByPeriods.interface";

const REPORT_BY_PERIODS_ENDPOINT =
  "/gp/gh/performanceEvaluation/personResult/report-by-evaluations";
const REPORT_BY_PERIODS_EXPORT_ENDPOINT = `${REPORT_BY_PERIODS_ENDPOINT}/export`;
const REPORT_BY_PERIODS_LEGACY_ENDPOINT =
  "/gp/gh/performanceEvaluation/personResult/report-by-periods";
const REPORT_BY_PERIODS_LEGACY_EXPORT_ENDPOINT =
  `${REPORT_BY_PERIODS_LEGACY_ENDPOINT}/export`;

function normalizeResponse(data: unknown): ReportByPeriodsResponse {
  if (Array.isArray(data)) {
    return {
      rows: data as ReportByPeriodsRow[],
      total: data.length,
      lastPage: 1,
      currentPage: 1,
    };
  }

  const response = data as ReportByPeriodsApiResponse;
  const rows = Array.isArray(response?.data) ? response.data : [];
  const total = response?.meta?.total ?? rows.length;
  const lastPage = response?.meta?.last_page ?? 1;
  const currentPage = response?.meta?.current_page ?? 1;

  return {
    rows,
    total,
    lastPage,
    currentPage,
  };
}

export async function getReportByPeriods(
  payload: ReportByPeriodsRequest,
): Promise<ReportByPeriodsResponse> {
  try {
    const { data } = await api.post<unknown>(REPORT_BY_PERIODS_ENDPOINT, payload);
    return normalizeResponse(data);
  } catch {
    const { data } = await api.post<unknown>(
      REPORT_BY_PERIODS_LEGACY_ENDPOINT,
      payload,
    );
    return normalizeResponse(data);
  }
}

export async function exportReportByPeriods(
  payload: Omit<ReportByPeriodsRequest, "page" | "per_page"> & {
    selected_person_ids: number[];
  },
): Promise<Blob> {
  try {
    const { data } = await api.post(REPORT_BY_PERIODS_EXPORT_ENDPOINT, payload, {
      responseType: "blob",
    });
    return data;
  } catch {
    const { data } = await api.post(REPORT_BY_PERIODS_LEGACY_EXPORT_ENDPOINT, payload, {
      responseType: "blob",
    });
    return data;
  }
}
