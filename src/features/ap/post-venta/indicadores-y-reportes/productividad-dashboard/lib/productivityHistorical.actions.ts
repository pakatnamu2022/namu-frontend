import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  ProductivityAnnualTrendsResponse,
  ProductivityCompareYearsFilters,
  ProductivityCompareYearsResponse,
  ProductivityHistoricalFilters,
  ProductivityMonthSnapshotFilters,
  ProductivityMonthSnapshotResponse,
  ProductivityMultiYearSummaryFilters,
  ProductivityMultiYearSummaryResponse,
} from "./productivityHistorical.interface";

const BASE_ENDPOINT = "/ap/postVenta/dashboard/productivity/historical";

export async function getProductivityAnnualTrends(
  filters: ProductivityHistoricalFilters,
): Promise<ProductivityAnnualTrendsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      year: filters.year,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  };

  const { data } = await api.get<ProductivityAnnualTrendsResponse>(
    `${BASE_ENDPOINT}/trends`,
    config,
  );
  return data;
}

export async function compareProductivityYears(
  filters: ProductivityCompareYearsFilters,
): Promise<ProductivityCompareYearsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      years: filters.years,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  };

  const { data } = await api.get<ProductivityCompareYearsResponse>(
    `${BASE_ENDPOINT}/compare-years`,
    config,
  );
  return data;
}

export async function getProductivityMonthSnapshot(
  filters: ProductivityMonthSnapshotFilters,
): Promise<ProductivityMonthSnapshotResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  };

  const { data } = await api.get<ProductivityMonthSnapshotResponse>(
    `${BASE_ENDPOINT}/${filters.year}/${filters.month}`,
    config,
  );
  return data;
}

export async function getProductivityMultiYearSummary(
  filters: ProductivityMultiYearSummaryFilters,
): Promise<ProductivityMultiYearSummaryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...(filters.start_year && { start_year: filters.start_year }),
      ...(filters.end_year && { end_year: filters.end_year }),
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  };

  const { data } = await api.get<ProductivityMultiYearSummaryResponse>(
    `${BASE_ENDPOINT}/summary`,
    config,
  );
  return data;
}
