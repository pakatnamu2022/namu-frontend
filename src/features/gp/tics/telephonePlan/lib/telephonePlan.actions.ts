import { api } from "@/core/api";
import {
  TelephonePlanResource,
  TelephonePlanResponse,
  getTelephonePlansProps,
} from "./telephonePlan.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { TELEPHONE_PLAN } from "./telephonePlan.constants";

const { ENDPOINT } = TELEPHONE_PLAN;

export async function getTelephonePlans({
  params,
}: getTelephonePlansProps): Promise<TelephonePlanResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<TelephonePlanResponse>(ENDPOINT, config);
  return data;
}

export async function findTelephonePlanById(
  id: string,
): Promise<TelephonePlanResource> {
  const response = await api.get<TelephonePlanResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTelephonePlan(
  data: any,
): Promise<TelephonePlanResponse> {
  const response = await api.post<TelephonePlanResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateTelephonePlan(
  id: string,
  data: any,
): Promise<TelephonePlanResponse> {
  const response = await api.put<TelephonePlanResponse>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteTelephonePlan(
  id: string,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getAllTelephonePlans(): Promise<TelephonePlanResource[]> {
  const config: AxiosRequestConfig = { params: { all: true } };
  const { data } = await api.get<TelephonePlanResource[]>(ENDPOINT, config);
  return data;
}
