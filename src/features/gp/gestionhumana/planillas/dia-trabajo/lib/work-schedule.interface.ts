import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface WorkScheduleResponse {
  data: WorkScheduleResource[];
  links: Links;
  meta: Meta;
}

export interface WorkScheduleResource {
  id: number;
  work_date: string;
  hours_worked: number;
  extra_hours: number;
  total_hours: number;
  notes: string | null;
  status: WorkScheduleStatus;
  worker: WorkScheduleWorker;
  work_type: WorkScheduleWorkType;
  period: WorkSchedulePeriod;
  created_at: string;
  updated_at: string;
}

export interface WorkScheduleWorker {
  id: number;
  full_name: string;
  vat: string;
}

export interface WorkScheduleWorkType {
  id: number;
  code: string;
  name: string;
  description: string;
  multiplier: number;
  base_hours: number;
  is_extra_hours: boolean;
  is_night_shift: boolean;
  is_holiday: boolean;
  is_sunday: boolean;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkSchedulePeriod {
  id: number;
  code: string;
  name: string;
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
  work_type_id: number;
  period_id: number;
  work_date: string;
  hours_worked?: number | null;
  extra_hours?: number | null;
  notes?: string | null;
  status?: WorkScheduleStatus | null;
}

export interface WorkScheduleBulkRequest {
  period_id: number;
  schedules: Omit<WorkScheduleRequest, "period_id">[];
}

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
  payment_date: string;
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
  total_normal_hours: number;
  total_extra_hours: number;
  total_night_hours: number;
  total_holiday_hours: number;
  days_worked: number;
}

export interface GetWorkSchedulesProps {
  params?: Record<string, any>;
}
