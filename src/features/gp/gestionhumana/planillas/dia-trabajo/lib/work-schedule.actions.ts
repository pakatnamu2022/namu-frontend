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

export async function getWorkSchedules({
  params,
}: GetWorkSchedulesProps): Promise<WorkScheduleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WorkScheduleResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkSchedules(
  params?: Record<string, any>
): Promise<WorkScheduleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WorkScheduleResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkScheduleById(
  id: string
): Promise<WorkScheduleResource> {
  const response = await api.get<WorkScheduleResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function getWorkSchedulesByPeriod(
  periodId: number,
  params?: Record<string, any>
): Promise<WorkScheduleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      period_id: periodId,
      ...params,
    },
  };
  const { data } = await api.get<WorkScheduleResource[]>(ENDPOINT, config);
  return data;
}

export async function getWorkScheduleSummary(
  periodId: number
): Promise<WorkScheduleSummaryResponse> {
  const response = await api.get<WorkScheduleSummaryResponse>(
    `${ENDPOINT}/summary/${periodId}`
  );
  return response.data;
}

export async function storeWorkSchedule(
  payload: WorkScheduleRequest
): Promise<WorkScheduleResource> {
  const response = await api.post<WorkScheduleResource>(ENDPOINT, payload);
  return response.data;
}

export async function storeWorkScheduleBulk(
  payload: WorkScheduleBulkRequest
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(`${ENDPOINT}/bulk`, payload);
  return response.data;
}

export async function updateWorkSchedule(
  id: string,
  payload: Partial<WorkScheduleRequest>
): Promise<WorkScheduleResource> {
  const response = await api.put<WorkScheduleResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return response.data;
}

export async function deleteWorkSchedule(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
