import type { Links, Meta } from "@/shared/lib/pagination.interface";

export interface WorkScheduleDetail {
  id: number;
  day_of_week: number;
  checkin: string | null;
  lunch_out: string | null;
  lunch_in: string | null;
  checkout: string | null;
}

export interface WorkScheduleResource {
  id: number;
  name: string;
  checkin: string;
  lunch_out: string | null;
  lunch_in: string | null;
  checkout: string;
  details: WorkScheduleDetail[];
}

export interface WorkScheduleResponse {
  data: WorkScheduleResource[];
  links: Links;
  meta: Meta;
}

export interface WorkScheduleDetailInput {
  day_of_week: number;
  checkin: string | null;
  lunch_out: string | null;
  lunch_in: string | null;
  checkout: string | null;
}

export interface WorkSchedulePayload {
  name: string;
  checkin: string;
  lunch_out: string | null;
  lunch_in: string | null;
  checkout: string;
  details?: WorkScheduleDetailInput[];
}

export interface WorkScheduleAssignBulkPayload {
  work_schedule_id: number;
  cargo_id?: number | null;
  area_id?: number | null;
  sede_id?: number | null;
  empresa_id?: number | null;
}

export interface WorkScheduleAssignBulkResponse {
  message: string;
  affected: number;
}

export interface WorkScheduleFilters {
  name?: string;
  id?: number;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface WorkScheduleAssignSinglePayload {
  work_schedule_id: number;
}

export type WorkScheduleAssignSingleResponse = WorkScheduleResource;
