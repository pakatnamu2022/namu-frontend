import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getWorkTypesProps,
  WorkTypeResource,
  WorkTypeResponse,
} from "./work-type.interface";
import { WORK_TYPE } from "./work-type.constant";

const { ENDPOINT } = WORK_TYPE;

export async function getWorkTypes({
  params,
}: getWorkTypesProps): Promise<WorkTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WorkTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkTypes(): Promise<WorkTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<WorkTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkTypeById(
  id: number
): Promise<WorkTypeResource> {
  const response = await api.get<WorkTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWorkType(data: any): Promise<WorkTypeResponse> {
  const response = await api.post<WorkTypeResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkType(
  id: number,
  data: any
): Promise<WorkTypeResponse> {
  const response = await api.put<WorkTypeResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWorkType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
