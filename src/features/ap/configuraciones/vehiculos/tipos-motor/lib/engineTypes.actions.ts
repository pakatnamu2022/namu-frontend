import { api } from "@/src/core/api";
import {
  EngineTypesResource,
  EngineTypesResponse,
  getEngineTypesProps,
} from "./engineTypes.interface";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { ENGINE_TYPES } from "./engineTypes.constants";
import { AP_MASTER_COMERCIAL } from "@/src/features/ap/lib/ap.constants";

const { ENDPOINT } = ENGINE_TYPES;

export async function getEngineTypes({
  params,
}: getEngineTypesProps): Promise<EngineTypesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.ENGINE_TYPE,
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
      type: AP_MASTER_COMERCIAL.ENGINE_TYPE,
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
