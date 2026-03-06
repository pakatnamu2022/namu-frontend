import { PayrollPeriodResource } from "../../periodo-planilla/lib/payroll-period.interface";

export type PayrollCalculationStatus =
  | "DRAFT"
  | "CALCULATED"
  | "APPROVED"
  | "PAID";
export type DetailType = "EARNING" | "DEDUCTION" | "CONTRIBUTION";
export type DetailCategory =
  | "ATTENDANCE"
  | "BONUS"
  | "TAX"
  | "INSURANCE"
  | "LOAN"
  | "OTHER";
export type HourType = "DIURNO" | "NOCTURNO" | null;

export interface PayrollCalculationDetail {
  id: number;
  payroll_calculation_id: number;
  code: string;
  concept_code?: string;
  concept_name?: string;
  type: DetailType;
  category: DetailCategory;
  description?: string;
  hour_type: HourType;
  hours: number | null;
  days_worked: number;
  multiplier: number | null;
  use_shift: boolean;
  base_amount: number | null;
  rate: number | null;
  hour_value: number;
  amount: number;
  calculation_order: number;
}

export interface WorkerSnapshot {
  id: number;
  full_name: string;
  vat: string;
  sueldo: number;
}

export interface PayrollCalculation {
  id: number;
  worker_id: number;
  period_id?: number;
  salary: number;
  shift_hours: number;
  base_hour_value: number;
  total_earnings: number;
  total_deductions: number;
  total_contributions: number;
  net_salary: number;
  status: PayrollCalculationStatus;
  calculated_at: string;
  calculated_by: number;
  approved_at: string | null;
  approved_by: number | null;
  paid_at: string | null;
  paid_by: number | null;
  period: PayrollPeriodResource;
  worker: WorkerSnapshot;
  details: PayrollCalculationDetail[];
}

// --- Summary (Preview) types ---

export interface SummaryDetailItem {
  code: string;
  hour_type: HourType;
  hours: number;
  multiplier: number;
  pay: boolean;
  use_shift: boolean;
  hour_value: number;
  days_worked: number;
  total: number;
}

export interface SummaryWorkerItem {
  worker_id: number;
  worker_name: string;
  salary: number;
  shift_hours: number;
  base_hour_value: number;
  details: SummaryDetailItem[];
  total_amount: number;
}

export interface PayrollSummaryData {
  period: PayrollPeriodResource;
  workers_count: number;
  summary: SummaryWorkerItem[];
}

export interface PayrollSummaryResponse extends PayrollSummaryData {
  success?: boolean;
}

// --- Attendances by period ---

export interface DailyAttendance {
  date: string;
  code: string;
  status: string;
}

export interface AttendanceSummary {
  codes: Record<string, number>;
  total_days: number;
}

export interface WorkerAttendance {
  worker_id: number;
  worker_name: string;
  document_number: string;
  daily_attendances: DailyAttendance[];
  summary: AttendanceSummary;
}

export interface AttendancePeriodInfo {
  period_id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  total_workers: number;
}

export interface AttendancesData extends AttendancePeriodInfo {
  attendances: WorkerAttendance[];
}

export interface AttendancesResponse extends AttendancesData {
  success?: boolean;
}

// --- Report (calculations/report/{periodId}) ---

export interface PayrollReportRow {
  empresa: string;
  nombre: string;
  dni: string;
  days_worked: number;
  basic_salary: number;
  night_bonus: number;
  gross_salary: number;
  overtime_25: number;
  overtime_35: number;
  holiday_pay: number;
  compensatory_pay: number;
  net_salary: number;
}

export interface PayrollReportTotals {
  days_worked: number;
  basic_salary: number;
  night_bonus: number;
  gross_salary: number;
  overtime_25: number;
  overtime_35: number;
  holiday_pay: number;
  compensatory_pay: number;
  net_salary: number;
}

export interface PayrollReportPeriod {
  id: number;
  code: string;
  name: string;
}

export interface PayrollReportData {
  period: PayrollReportPeriod;
  rows: PayrollReportRow[];
  totals: PayrollReportTotals;
}

export interface PayrollReportResponse {
  data: PayrollReportData;
}

// --- Generate / Recalculate response ---

export interface GenerateCalculationsResult {
  success: boolean;
  period_id: number;
  calculations_created: number;
  calculation_ids: number[];
  errors: string[];
}

export interface GenerateCalculationsResponse {
  success: boolean;
  data: GenerateCalculationsResult;
  message: string;
}
