import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { ExclusionRequest, ExclusionResource, ExclusionResponse } from "./exclusion.interface";
import { PAYROLL_EXCLUSION } from "./exclusion.constants";

const { ENDPOINT } = PAYROLL_EXCLUSION;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getExclusions(
  params?: Record<string, any>,
): Promise<ExclusionResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<ExclusionResponse>(ENDPOINT, config);
  return data;
}

export async function storeExclusion(
  payload: ExclusionRequest,
): Promise<ExclusionResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<ExclusionResource>(data);
}

export async function deleteExclusion(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return unwrap<GeneralResponse>(data);
}
