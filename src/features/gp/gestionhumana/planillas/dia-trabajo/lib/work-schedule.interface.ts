import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface WorkScheduleResponse {
  data: WorkScheduleResource[];
  links: Links;
  meta: Meta;
}

export interface WorkScheduleResource {
  id: number;
  worker_id?: number;
  code: string;
  period_id?: number;
  work_date: string;
  hours_worked?: number;
  extra_hours?: number;
  total_hours?: number | null;
  status: WorkScheduleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Relaciones opcionales
  worker?: WorkScheduleWorker;
  period?: WorkSchedulePeriod;
}

export interface WorkScheduleWorker {
  id: number;
  full_name: string;
  vat: string;
  sueldo?: number;
  horas_jornada?: number;
}

export interface WorkSchedulePeriod {
  id: number;
  code: string;
  name: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  status: string;
}

export type WorkScheduleStatus =
  | "SCHEDULED"
  | "WORKED"
  | "ABSENT"
  | "VACATION"
  | "SICK_LEAVE"
  | "PERMISSION";

export interface WorkScheduleRequest {
  worker_id: number;
  code: string;
  period_id: number;
  work_date: string;
  status?: WorkScheduleStatus;
  notes?: string | null;
}

export interface WorkScheduleBulkRequest {
  period_id: number;
  schedules: Omit<WorkScheduleRequest, "period_id">[];
}

// Respuesta del endpoint GET /schedules/summary/{periodId}
export interface WorkScheduleSummaryResponse {
  period: WorkScheduleSummaryPeriod;
  workers_count: number;
  summary: WorkScheduleWorkerSummary[];
}

export interface WorkScheduleSummaryPeriod {
  id: number;
  code: string;
  name: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  payment_date: string | null;
  status: string;
  can_modify: boolean;
  can_calculate: boolean;
  company: null;
  created_at: string;
  updated_at: string;
}

export interface WorkScheduleWorkerSummary {
  worker_id: number;
  worker_name: string;
  salary: number;
  shift_hours: number;
  base_hour_value: number;
  details: WorkScheduleSummaryDetail[];
  total_amount: number;
}

export interface WorkScheduleSummaryDetail {
  code: string;
  hour_type: string; // "DIURNO" | "NOCTURNO" | "REFRIGERIO"
  hours: number;
  multiplier: number;
  pay: boolean;
  use_shift: boolean;
  hour_value: number;
  days_worked: number;
  total: number;
}

export interface GetWorkSchedulesProps {
  params?: Record<string, any>;
}
