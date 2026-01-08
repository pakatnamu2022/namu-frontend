import { api } from "@/core/api";
import {
  EngineTypesResource,
  EngineTypesResponse,
  getEngineTypesProps,
} from "./engineTypes.interface";
import type { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { ENGINE_TYPES } from "./engineTypes.constants";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const { ENDPOINT } = ENGINE_TYPES;

export async function getEngineTypes({
  params,
}: getEngineTypesProps): Promise<EngineTypesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.ENGINE_TYPE,
    },
  };
  const { data } = await api.get<EngineTypesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllEngineTypes({
  params,
}: getEngineTypesProps): Promise<EngineTypesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      type: AP_MASTER_TYPE.ENGINE_TYPE,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<EngineTypesResource[]>(ENDPOINT, config);
  return data;
}

export async function findEngineTypesById(
  id: number
): Promise<EngineTypesResource> {
  const response = await api.get<EngineTypesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeEngineTypes(
  data: any
): Promise<EngineTypesResource> {
  const response = await api.post<EngineTypesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateEngineTypes(
  id: number,
  data: any
): Promise<EngineTypesResource> {
  const response = await api.put<EngineTypesResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteEngineTypes(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
