import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PLANS } from "./plans.constants";
import { getPlansProps, PlansResource, PlansResponse } from "./plans.interface";
import { PlansSchema } from "./plans.schema";

const { ENDPOINT } = PLANS;

export async function getPlans({
  params,
}: getPlansProps): Promise<PlansResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<PlansResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPlans({
  params,
}: getPlansProps = {}): Promise<PlansResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true, ...params },
  };
  const { data } = await api.get<PlansResource[]>(ENDPOINT, config);
  return data;
}

export async function findPlansById(id: number): Promise<PlansResource> {
  const { data } = await api.get<PlansResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storePlans(payload: PlansSchema): Promise<PlansResource> {
  const { data } = await api.post<PlansResource>(ENDPOINT, payload);
  return data;
}

export async function updatePlans(
  id: number,
  payload: Partial<PlansSchema>,
): Promise<PlansResource> {
  const { data } = await api.put<PlansResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deletePlans(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
