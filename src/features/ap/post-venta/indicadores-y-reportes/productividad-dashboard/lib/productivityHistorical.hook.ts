import { useQuery } from "@tanstack/react-query";
import {
  compareProductivityYears,
  getProductivityAnnualTrends,
  getProductivityMonthSnapshot,
  getProductivityMultiYearSummary,
} from "./productivityHistorical.actions";
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

export const PRODUCTIVITY_ANNUAL_TRENDS_QUERY_KEY = "productivityAnnualTrends";
export const PRODUCTIVITY_COMPARE_YEARS_QUERY_KEY = "productivityCompareYears";
export const PRODUCTIVITY_MONTH_SNAPSHOT_QUERY_KEY =
  "productivityMonthSnapshot";
export const PRODUCTIVITY_MULTI_YEAR_SUMMARY_QUERY_KEY =
  "productivityMultiYearSummary";

export const useProductivityAnnualTrends = (
  filters: ProductivityHistoricalFilters,
) => {
  return useQuery<ProductivityAnnualTrendsResponse>({
    queryKey: [
      PRODUCTIVITY_ANNUAL_TRENDS_QUERY_KEY,
      filters.year,
      filters.sede_id ?? "all",
    ],
    queryFn: () => getProductivityAnnualTrends(filters),
    enabled: !!filters.year,
  });
};

export const useProductivityCompareYears = (
  filters: ProductivityCompareYearsFilters | null,
) => {
  return useQuery<ProductivityCompareYearsResponse>({
    queryKey: [
      PRODUCTIVITY_COMPARE_YEARS_QUERY_KEY,
      filters?.years.join("-"),
      filters?.sede_id ?? "all",
    ],
    queryFn: () => compareProductivityYears(filters!),
    enabled: !!filters && filters.years.length >= 2,
  });
};

export const useProductivityMonthSnapshot = (
  filters: ProductivityMonthSnapshotFilters,
  enabled: boolean = true,
) => {
  return useQuery<ProductivityMonthSnapshotResponse>({
    queryKey: [
      PRODUCTIVITY_MONTH_SNAPSHOT_QUERY_KEY,
      filters.year,
      filters.month,
      filters.sede_id ?? "all",
    ],
    queryFn: () => getProductivityMonthSnapshot(filters),
    enabled: enabled && !!filters.year && !!filters.month,
    // El mes se infiere del último label de trends, que puede no coincidir con
    // un mes que realmente tenga snapshot guardado (backend responde success:false).
    // No tiene sentido reintentar ese mismo período fallido varias veces.
    retry: false,
  });
};

export const useProductivityMultiYearSummary = (
  filters: ProductivityMultiYearSummaryFilters,
) => {
  return useQuery<ProductivityMultiYearSummaryResponse>({
    queryKey: [
      PRODUCTIVITY_MULTI_YEAR_SUMMARY_QUERY_KEY,
      filters.start_year ?? "default",
      filters.end_year ?? "default",
      filters.sede_id ?? "all",
    ],
    queryFn: () => getProductivityMultiYearSummary(filters),
  });
};
