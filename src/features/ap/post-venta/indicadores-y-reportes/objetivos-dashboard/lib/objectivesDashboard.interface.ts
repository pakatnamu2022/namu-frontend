export type ObjectiveStatus =
  | "critical"
  | "warning"
  | "on_track"
  | "exceeded"
  | "not_applicable";

export type ObjectiveTrend = "up" | "down" | "stable";

export interface ObjectivesDashboardFilters {
  year: number;
  month: number;
  sede_id?: number;
  use_cache?: boolean;
}

export interface PeriodInfo {
  year: number;
  month: number;
  name: string;
  start_date: string;
  end_date: string;
  current_date: string;
  days_in_month: number;
  days_elapsed: number;
  days_remaining: number;
}

export interface ExpectedVsReal {
  expected_percentage: number;
  real_percentage: number;
  difference: number;
}

export interface ExecutiveSummary {
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  trend: ObjectiveTrend;
  days_remaining: number;
  expected_vs_real: ExpectedVsReal;
}

export interface ExecutiveVehicularCrossingSummary {
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  trend: ObjectiveTrend;
  days_remaining: number;
  expected_vs_real: ExpectedVsReal;
}

export interface AreaProgress {
  objective: number;
  progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
}

export type VehicleCrossingProgress = AreaProgress;

export interface ConceptSummary {
  id: number;
  description: string;
  area_name: string;
  objective: number;
  progress: number;
  completion_percentage: number;
  is_vehicular_crossing: boolean;
  status: ObjectiveStatus;
}

export interface HeadquarterSummary {
  id: number;
  name: string;
  abbreviation: string;
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  rank: number;
  concepts_summary: ConceptSummary[];
}

export interface HeadquartersComparisonChartData {
  labels: string[];
  datasets: {
    objectives: number[];
    progress: number[];
    completion_percentages: number[];
  };
}

export interface HeadquartersComparison {
  ranking: HeadquarterSummary[];
  chart_data: HeadquartersComparisonChartData;
}

export interface GlobalAreaSummary {
  area_id: number;
  area_name: string;
  is_vehicular_crossing: boolean;
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
}

export interface ConceptBreakdown {
  concept_id: number;
  concept_name: string;
  progress: number;
  percentage_of_total: number;
}

export interface BrandBreakdown {
  brand_name: string;
  total_billing: number;
  vehicle_count: number;
  percentage_of_total: number;
}

export interface VehicleCrossingByBrand {
  brand_name: string;
  count: number;
  percentage_of_total: number;
}

export interface AdvisorPerformance {
  advisor_id: number;
  advisor_name: string;
  objective: number;
  progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  rank: number;
}

export interface Concept {
  id: number;
  description: string;
  area_id: number;
  area_name: string;
  is_vehicular_crossing: boolean;
  objective: number;
  progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  by_brand?: (BrandBreakdown | VehicleCrossingByBrand)[];
  top_advisors?: AdvisorPerformance[];
}

export interface HeadquarterDetail {
  id: number;
  name: string;
  abbreviation: string;
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  concepts: Concept[];
}

export interface ObjectivesDashboardData {
  period: PeriodInfo;
  executive_summary: ExecutiveSummary;
  executive_summary_vehicular_crossing: ExecutiveVehicularCrossingSummary;
  global_areas_summary: GlobalAreaSummary[];
  headquarters_comparison: HeadquartersComparison;
  headquarters_detail: HeadquarterDetail[];
}

export interface ObjectivesDashboardResponse {
  success: boolean;
  data: ObjectivesDashboardData;
}
