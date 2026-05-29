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
