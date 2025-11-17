import { AxiosRequestConfig } from "axios";
import {
  DetailedDevelopmentPlanResource,
  DetailedDevelopmentPlanResponse,
  GetDetailedDevelopmentPlansProps,
  StoreDetailedDevelopmentPlanRequest,
  UpdateDetailedDevelopmentPlanRequest,
} from "./detailedDevelopmentPlan.interface";
import { DETAILED_DEVELOPMENT_PLAN } from "./detailedDevelopmentPlan.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = DETAILED_DEVELOPMENT_PLAN;

export async function getDetailedDevelopmentPlans({
  params,
}: GetDetailedDevelopmentPlansProps = {}): Promise<DetailedDevelopmentPlanResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<DetailedDevelopmentPlanResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllDetailedDevelopmentPlans(
  params?: Record<string, any>
): Promise<DetailedDevelopmentPlanResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<DetailedDevelopmentPlanResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findDetailedDevelopmentPlanById(
  id: number
): Promise<DetailedDevelopmentPlanResource> {
  const { data } = await api.get<DetailedDevelopmentPlanResource>(
    `${ENDPOINT}/${id}`
  );
  return data;
}

export async function storeDetailedDevelopmentPlan(
  payload: StoreDetailedDevelopmentPlanRequest
): Promise<DetailedDevelopmentPlanResource> {
  const { data } = await api.post<DetailedDevelopmentPlanResource>(
    ENDPOINT,
    payload
  );
  return data;
}

export async function updateDetailedDevelopmentPlan(
  id: number,
  payload: UpdateDetailedDevelopmentPlanRequest
): Promise<DetailedDevelopmentPlanResource> {
  const { data } = await api.put<DetailedDevelopmentPlanResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteDetailedDevelopmentPlan(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
