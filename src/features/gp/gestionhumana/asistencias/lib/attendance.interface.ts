export type MarkType = "check_in" | "lunch_out" | "lunch_in" | "check_out";

export interface AttendanceRecord {
  id: number;
  zkbio_transaction_id: number | null;
  person_id: number | null;
  emp_code: string;
  full_name: string;
  date: string;
  mark_type: MarkType;
  time: string;
  area: string | null;
  punch_state_original: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
  person: Record<string, any> | null;
}

export interface AttendanceMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AttendanceResponse {
  current_page: number;
  data: AttendanceRecord[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface AttendanceFilters {
  search?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  emp_code?: string;
  person_id?: number | null;
  mark_type?: MarkType | "";
  per_page?: number;
  page?: number;
}

export interface AttendanceSyncResponse {
  message: string;
  new_records: number;
  total_for_day: number;
}

export interface AttendanceReportFilters {
  date_from: string;
  date_to: string;
  search?: string;
  emp_code?: string;
  person_id?: number;
  per_page?: number;
  page?: number;
}

export interface AttendanceDailyRecord {
  date: string;
  check_in: string | null;
  lunch_out: string | null;
  lunch_in: string | null;
  check_out: string | null;
  hours_worked: number | null;
  expected_hours: number;
  balance: number | null;
}

export interface AttendanceInternalRow {
  person_id: number | null;
  emp_code: string;
  full_name: string;
  days_present: number;
  expected_hours: number;
  hours_worked: number;
  balance: number;
  daily: AttendanceDailyRecord[];
}

export interface AttendanceInternalResponse {
  data: AttendanceInternalRow[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface AttendanceSunafilRow {
  date: string;
  emp_code: string;
  vat: string | null;
  full_name: string;
  check_in: string;
  check_out: string | null;
  hours_worked: number | null;
}

export interface AttendanceSunafilResponse {
  data: AttendanceSunafilRow[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface AttendanceSunafilFilters {
  date_from: string;
  date_to: string;
  search?: string;
  emp_code?: string;
  person_id?: number;
  per_page?: number;
  page?: number;
}

export interface AttendancePersonDashboard {
  person_id: number;
  emp_code: string;
  full_name: string;
  vat: string;
  date_from: string;
  date_to: string;
  days_present: number;
  expected_hours: number;
  hours_worked: number;
  balance: number;
  daily: AttendanceDailyRecord[];
}
