import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ACTIVITIES } from "./activities.constants";
import {
  ActivitiesResource,
  ActivitiesResponse,
  ActivityLocationResource,
  getActivitiesProps,
} from "./activities.interface";
import { ActivitiesSchema, ActivityLocationSchema } from "./activities.schema";

const { ENDPOINT } = ACTIVITIES;

export async function getActivities({
  params,
}: getActivitiesProps): Promise<ActivitiesResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ActivitiesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllActivities({
  params,
}: getActivitiesProps = {}): Promise<ActivitiesResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<ActivitiesResource[]>(ENDPOINT, config);
  return data;
}

export async function findActivitiesById(
  id: number,
): Promise<ActivitiesResource> {
  const { data } = await api.get<ActivitiesResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeActivities(
  payload: ActivitiesSchema,
): Promise<ActivitiesResource> {
  const { data } = await api.post<ActivitiesResource>(ENDPOINT, payload);
  return data;
}

export async function updateActivities(
  id: number,
  payload: Partial<ActivitiesSchema>,
): Promise<ActivitiesResource> {
  const { data } = await api.put<ActivitiesResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteActivities(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function changeActivityStatus(
  id: number,
  status: string,
): Promise<ActivitiesResource> {
  const { data } = await api.patch<ActivitiesResource>(
    `${ENDPOINT}/${id}/status`,
    { status },
  );
  return data;
}

export async function getActivityTypes(): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>(`${ENDPOINT}/activity-types`);
  return data.data;
}

export async function getActivityChannels(): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>(`${ENDPOINT}/channels`);
  return data.data;
}

export async function downloadActivitySupportsPdf(activityId: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${activityId}/supports/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sustentos-actividad-${activityId}.pdf`);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function addActivityLocation(
  activityId: number,
  payload: ActivityLocationSchema,
): Promise<ActivityLocationResource> {
  const { data } = await api.post<ActivityLocationResource>(
    `${ENDPOINT}/${activityId}/locations`,
    payload,
  );
  return data;
}
