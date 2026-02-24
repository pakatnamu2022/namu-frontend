import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  GetWorkSchedulesProps,
  WorkScheduleBulkRequest,
  WorkScheduleRequest,
  WorkScheduleResource,
  WorkScheduleResponse,
  WorkScheduleSummaryResponse,
} from "./work-schedule.interface";
import { WORK_SCHEDULE } from "./work-schedule.constant";

const { ENDPOINT } = WORK_SCHEDULE;

// Helper para extraer data de la respuesta envuelta { success, data: {...} }
function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getWorkSchedules({
  params,
}: GetWorkSchedulesProps): Promise<WorkScheduleResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<WorkScheduleResponse>(ENDPOINT, config);
  return data;
}

export async function getWorkSchedulesByPeriod(
  periodId: number,
  params?: Record<string, any>,
): Promise<WorkScheduleResource[]> {
  const config: AxiosRequestConfig = {
    params: { period_id: periodId, per_page: 100, ...params },
  };
  const { data } = await api.get<any>(ENDPOINT, config);
  // Soporta respuesta paginada { data: { data: [...] } } o array directo
  const inner = unwrap<any>(data);
  return Array.isArray(inner) ? inner : (inner?.data ?? []);
}

export async function getWorkScheduleSummary(
  periodId: number,
): Promise<WorkScheduleSummaryResponse> {
  const { data } = await api.get<any>(`${ENDPOINT}/summary/${periodId}`);
  return unwrap<WorkScheduleSummaryResponse>(data);
}

export async function findWorkScheduleById(
  id: string,
): Promise<WorkScheduleResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<WorkScheduleResource>(data);
}

export async function storeWorkSchedule(
  payload: WorkScheduleRequest,
): Promise<WorkScheduleResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<WorkScheduleResource>(data);
}

export async function storeWorkScheduleBulk(
  payload: WorkScheduleBulkRequest,
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(`${ENDPOINT}/bulk`, payload);
  return response.data;
}

export async function updateWorkSchedule(
  id: string,
  payload: Partial<WorkScheduleRequest>,
): Promise<WorkScheduleResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<WorkScheduleResource>(data);
}

export async function deleteWorkSchedule(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
