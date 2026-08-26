export type TechnicianProductivityRankingStatus =
  | "critical"
  | "warning"
  | "on_track"
  | "exceeded";

export interface TechnicianProductivityRankingFilters {
  date_range: [string, string];
  sede_id: number;
  use_cache?: boolean;
}

export interface TechnicianProductivityMissingMarkDetail {
  date: string;
  missing_marks: string[];
}

export interface TechnicianProductivityAttendanceSummary {
  days_with_checkin: number;
  days_with_checkout: number;
  days_with_missing_marks: number;
  missing_marks_details: TechnicianProductivityMissingMarkDetail[];
}

export interface TechnicianProductivityRankingItem {
  sede_id: number;
  sede_name: string;
  sede_abbreviation: string;
  worker_id: number;
  worker_dni: string;
  worker_name: string;
  has_error: boolean;
  days_worked: number;
  standard_hours: number;
  real_hours: number;
  billed_hours: number;
  productivity_hours: number;
  productivity_percentage: number;
  earnings: number;
  status: TechnicianProductivityRankingStatus;
  attendance_summary: TechnicianProductivityAttendanceSummary;
  rank: number;
}

export interface TechnicianProductivityRankingResponse {
  success: boolean;
  data: TechnicianProductivityRankingItem[];
}
