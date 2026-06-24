import { api } from "@/core/api";
import { WORK_SCHEDULE } from "./work-schedule.constants";
import type {
  WorkScheduleResponse,
  WorkScheduleResource,
  WorkSchedulePayload,
  WorkScheduleFilters,
  WorkScheduleAssignBulkPayload,
  WorkScheduleAssignBulkResponse,
  WorkScheduleAssignSinglePayload,
  WorkScheduleAssignSingleResponse,
} from "./work-schedule.interface";

const { ENDPOINT } = WORK_SCHEDULE;

export async function getWorkSchedules(
  filters: WorkScheduleFilters,
): Promise<WorkScheduleResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params[key] = value;
    }
  });
  const { data } = await api.get<WorkScheduleResponse>(ENDPOINT, { params });
  return data;
}

export async function getWorkScheduleById(
  id: number,
): Promise<WorkScheduleResource> {
  const { data } = await api.get<WorkScheduleResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeWorkSchedule(
  payload: WorkSchedulePayload,
): Promise<WorkScheduleResource> {
  const { data } = await api.post<WorkScheduleResource>(ENDPOINT, payload);
  return data;
}

export async function updateWorkSchedule(
  id: number,
  payload: Partial<WorkSchedulePayload>,
): Promise<WorkScheduleResource> {
  const { data } = await api.put<WorkScheduleResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteWorkSchedule(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}

export async function assignBulkWorkSchedule(
  payload: WorkScheduleAssignBulkPayload,
): Promise<WorkScheduleAssignBulkResponse> {
  const { data } = await api.post<WorkScheduleAssignBulkResponse>(
    `${ENDPOINT}/assign-bulk`,
    payload,
  );
  return data;
}

export async function assignWorkSchedule(
  workerId: number,
  payload: WorkScheduleAssignSinglePayload,
): Promise<WorkScheduleAssignSingleResponse> {
  const { data } = await api.post<WorkScheduleAssignSingleResponse>(
    `${ENDPOINT}/assign/${workerId}`,
    payload,
  );
  return data;
}
