export type ProductivityStatus =
  | "critical"
  | "warning"
  | "on_track"
  | "exceeded";

export interface ProductivityDashboardFilters {
  year: number;
  month: number;
  sede_id?: number;
  use_cache?: boolean;
}

export interface ProductivityPeriodInfo {
  start_date: string;
  end_date: string;
  current_date: string;
  total_days: number;
  working_days: number;
  description: string;
}

export interface ProductivityConfigurations {
  working_hours_per_day: number;
  earnings_per_hour: number;
}

export interface ProductivityStatusBreakdown {
  exceeded: number;
  on_track: number;
  warning: number;
  critical: number;
}

export interface ProductivityExecutiveSummary {
  total_technicians: number;
  total_headquarters: number;
  total_standard_hours: number;
  total_billed_hours: number;
  total_productivity_hours: number;
  total_earnings: number;
  average_productivity_percentage: number;
  status: ProductivityStatus;
  status_breakdown: ProductivityStatusBreakdown;
}

export interface ProductivityHeadquarterSummary {
  rank: number;
  sede_id: number;
  sede_name: string;
  sede_abbreviation: string;
  technician_count: number;
  total_standard_hours: number;
  total_billed_hours: number;
  total_productivity_hours: number;
  total_earnings: number;
  average_productivity_percentage: number;
  status: ProductivityStatus;
}

export interface ProductivityTechnicianDetail {
  rank: number;
  sede_id: number;
  sede_name: string;
  sede_abbreviation: string;
  worker_id: number;
  worker_dni: string;
  worker_name: string;
  has_error?: boolean;
  days_worked?: number;
  real_hours?: number;
  standard_hours: number;
  billed_hours: number;
  productivity_hours: number;
  productivity_percentage: number;
  earnings: number;
  status: ProductivityStatus;
}

export interface ProductivityChartData {
  labels: string[];
  datasets: {
    standard_hours: number[];
    billed_hours: number[];
    productivity_hours: number[];
    earnings: number[];
    productivity_percentage: number[];
  };
}

export interface ProductivityDashboardData {
  period: ProductivityPeriodInfo;
  configurations: ProductivityConfigurations;
  executive_summary: ProductivityExecutiveSummary;
  headquarters_summary: ProductivityHeadquarterSummary[];
  technician_detail: ProductivityTechnicianDetail[];
  chart_data: ProductivityChartData;
}

export interface ProductivityDashboardResponse {
  success: boolean;
  data: ProductivityDashboardData;
}
