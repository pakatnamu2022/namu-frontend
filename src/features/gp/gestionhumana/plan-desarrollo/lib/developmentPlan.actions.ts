import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  DevelopmentPlanRequest,
  DevelopmentPlanResource,
  DevelopmentPlanResponse,
} from "./developmentPlan.interface";
import { DEVELOPMENT_PLAN } from "./developmentPlan.constants";

const { ENDPOINT } = DEVELOPMENT_PLAN;

export interface GetDevelopmentPlansParams {
  page?: number;
  per_page?: number;
  search?: string;
  worker_id?: number;
}

export interface GetDevelopmentPlansProps {
  params?: GetDevelopmentPlansParams;
}

export async function getDevelopmentPlans({
  params,
}: GetDevelopmentPlansProps): Promise<DevelopmentPlanResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<DevelopmentPlanResponse>(ENDPOINT, config);
  return data;
}

export async function getAllDevelopmentPlans({
  params,
}: GetDevelopmentPlansProps): Promise<DevelopmentPlanResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<DevelopmentPlanResource[]>(ENDPOINT, config);
  return data;
}

export async function getDevelopmentPlanById(
  id: number
): Promise<DevelopmentPlanResource> {
  const { data } = await api.get<DevelopmentPlanResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeDevelopmentPlan(
  payload: DevelopmentPlanRequest
): Promise<DevelopmentPlanResource> {
  const { data } = await api.post<DevelopmentPlanResource>(ENDPOINT, payload);
  return data;
}

export async function updateDevelopmentPlan(
  id: number,
  payload: Partial<DevelopmentPlanRequest>
): Promise<DevelopmentPlanResource> {
  const { data } = await api.put<DevelopmentPlanResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteDevelopmentPlan(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
