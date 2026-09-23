// Interfaces del Dashboard Histórico de Productividad (vista gerencial)

export interface ProductivityHistoricalFilters {
  year: number;
  sede_id?: number;
}

export interface ProductivityHistoricalTrends {
  labels: string[];
  productivity_percentage: number[];
  billed_hours: number[];
  standard_hours: number[];
  earnings: number[];
  ots_closed: number[];
  labour_coverage_rate: number[];
  technicians_exceeded: number[];
  technicians_on_track: number[];
  technicians_warning: number[];
  technicians_critical: number[];
}

export interface ProductivityHistoricalBestWorstMonth {
  month: number;
  productivity: number;
}

export interface ProductivityHistoricalSummaryStats {
  total_billed_hours: number;
  total_standard_hours: number;
  total_earnings: number;
  total_ots_closed: number;
  avg_productivity_percentage: number;
  avg_labour_coverage_rate: number;
  avg_technicians: number;
  best_month: ProductivityHistoricalBestWorstMonth | null;
  worst_month: ProductivityHistoricalBestWorstMonth | null;
}

export interface ProductivityAnnualTrendsData {
  year: number;
  sede_id: number | null;
  sede_name: string;
  period_count: number;
  trends: ProductivityHistoricalTrends;
  summary: ProductivityHistoricalSummaryStats;
}

export interface ProductivityAnnualTrendsResponse {
  success: boolean;
  data: ProductivityAnnualTrendsData;
}

export interface ProductivityCompareYearsFilters {
  years: number[];
  sede_id?: number;
}

export interface ProductivityYearComparisonEntry {
  year: number;
  months_with_data: number;
  trends: ProductivityHistoricalTrends;
  summary: ProductivityHistoricalSummaryStats;
}

export interface ProductivityCompareYearsData {
  years: number[];
  sede_id: number | null;
  comparison: Record<string, ProductivityYearComparisonEntry>;
}

export interface ProductivityCompareYearsResponse {
  success: boolean;
  data: ProductivityCompareYearsData;
}

export interface ProductivityMonthSnapshotFilters {
  year: number;
  month: number;
  sede_id?: number;
}

export interface ProductivityMonthSnapshot {
  id: number;
  year: number;
  month: number;
  sede_id: number | null;
  total_technicians: number;
  total_billed_hours: string;
  total_standard_hours: string;
  total_productivity_hours: string;
  total_earnings: string;
  average_productivity_percentage: string;
  total_ots_closed: number;
  ots_with_labour_charged: number;
  ots_without_labour_charged: number;
  avg_hours_per_ot: string;
  billing_rate: string;
  reentry_rate: string;
  labour_coverage_rate: string;
  technicians_exceeded: number;
  technicians_on_track: number;
  technicians_warning: number;
  technicians_critical: number;
  snapshot_date: string;
  created_at: string;
}

export interface ProductivityMonthComparison {
  productivity_percentage_change: number;
  billed_hours_change: number;
  earnings_change: number;
  ots_closed_change: number;
  labour_coverage_change: number;
  technicians_change: number;
}

export interface ProductivityMonthSnapshotData {
  snapshot: ProductivityMonthSnapshot;
  period_description: string;
  comparison_with_previous_month: ProductivityMonthComparison | null;
}

export interface ProductivityMonthSnapshotResponse {
  success: boolean;
  data: ProductivityMonthSnapshotData;
}

export interface ProductivityMultiYearSummaryFilters {
  start_year?: number;
  end_year?: number;
  sede_id?: number;
}

// La forma exacta del resumen multi-anual no está detallada en la doc de API;
// se tipa de forma flexible y se ajusta cuando se confirme la respuesta real.
export interface ProductivityMultiYearSummaryData {
  start_year: number;
  end_year: number;
  sede_id: number | null;
  years: ProductivityYearComparisonEntry[];
}

export interface ProductivityMultiYearSummaryResponse {
  success: boolean;
  data: ProductivityMultiYearSummaryData;
}
