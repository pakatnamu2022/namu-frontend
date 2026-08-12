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

export interface AreaProgress {
  objective: number;
  progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
}

export type VehicleCrossingProgress = AreaProgress;

export interface HeadquarterSummary {
  id: number;
  name: string;
  abbreviation: string;
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  rank: number;
  areas_summary: {
    workshop: AreaProgress;
    counter: AreaProgress;
    vehicle_crossing: VehicleCrossingProgress;
  };
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

export interface AdvisorPerformance {
  advisor_id: number;
  advisor_name: string;
  objective: number;
  progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  rank: number;
}

export interface WorkshopDetail {
  objective: number;
  progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  by_concept: ConceptBreakdown[];
  by_brand: BrandBreakdown[];
  top_advisors: AdvisorPerformance[];
}

export type CounterDetail = AreaProgress;

export interface VehicleCrossingByBrand {
  brand_name: string;
  count: number;
  percentage_of_total: number;
}

export interface VehicleCrossingDetail extends AreaProgress {
  by_brand: VehicleCrossingByBrand[];
}

export interface HeadquarterDetail {
  id: number;
  name: string;
  abbreviation: string;
  total_objective: number;
  total_progress: number;
  completion_percentage: number;
  status: ObjectiveStatus;
  workshop: WorkshopDetail;
  counter: CounterDetail;
  vehicle_crossing: VehicleCrossingDetail;
}

export interface ObjectivesDashboardData {
  period: PeriodInfo;
  executive_summary: ExecutiveSummary;
  headquarters_comparison: HeadquartersComparison;
  headquarters_detail: HeadquarterDetail[];
}

export interface ObjectivesDashboardResponse {
  success: boolean;
  data: ObjectivesDashboardData;
}
