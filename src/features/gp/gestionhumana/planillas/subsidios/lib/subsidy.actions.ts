import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  SubsidyCreateRequest,
  SubsidyEstimate,
  SubsidyResource,
  SubsidyResponse,
  SubsidyUpdateRequest,
} from "./subsidy.interface";
import { SUBSIDY } from "./subsidy.constants";

const { ENDPOINT } = SUBSIDY;

const unwrap = <T>(response: any): T => {
  const inner = response?.data ?? response;
  return (inner?.data ?? inner) as T;
};

export async function getSubsidies(
  params?: Record<string, any>,
): Promise<SubsidyResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<SubsidyResponse>(ENDPOINT, config);
  return data;
}

export async function estimateSubsidy(params: {
  worker_id: number;
  start_date: string;
  end_date: string;
}): Promise<SubsidyEstimate> {
  const { data } = await api.get<any>(`${ENDPOINT}/estimate`, { params });
  return unwrap<SubsidyEstimate>(data);
}

export async function storeSubsidy(
  payload: SubsidyCreateRequest,
): Promise<SubsidyResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<SubsidyResource>(data);
}

export async function updateSubsidy(
  id: number,
  payload: SubsidyUpdateRequest,
): Promise<SubsidyResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<SubsidyResource>(data);
}

export async function deleteSubsidy(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
