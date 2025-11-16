import { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AP_SAFE_CREDIT_GOAL } from "./apSafeCreditGoal.constants";
import {
  ApSafeCreditGoalResource,
  ApSafeCreditGoalResponse,
  getApSafeCreditGoalProps,
} from "./apSafeCreditGoal.interface";

const { ENDPOINT } = AP_SAFE_CREDIT_GOAL;

export async function getApSafeCreditGoal({
  params,
}: getApSafeCreditGoalProps): Promise<ApSafeCreditGoalResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ApSafeCreditGoalResponse>(ENDPOINT, config);
  return data;
}

export async function findApSafeCreditGoalById(
  id: number
): Promise<ApSafeCreditGoalResource> {
  const response = await api.get<ApSafeCreditGoalResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeApSafeCreditGoal(
  data: any
): Promise<ApSafeCreditGoalResource> {
  const response = await api.post<ApSafeCreditGoalResource>(ENDPOINT, data);
  return response.data;
}

export async function updateApSafeCreditGoal(
  id: number,
  data: any
): Promise<ApSafeCreditGoalResource> {
  const response = await api.put<ApSafeCreditGoalResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteApSafeCreditGoal(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
