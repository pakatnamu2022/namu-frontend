import { AxiosRequestConfig } from "axios";
import {
  getModelsVnProps,
  ModelsVnResource,
  ModelsVnResponse,
} from "./modelsVn.interface";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { MODELS_VN } from "./modelsVn.constanst";

const { ENDPOINT } = MODELS_VN;

export async function getModelsVn({
  params,
}: getModelsVnProps): Promise<ModelsVnResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ModelsVnResponse>(ENDPOINT, config);
  return data;
}

export async function getModelsVnSearch({
  params,
}: getModelsVnProps): Promise<ModelsVnResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ModelsVnResponse>(ENDPOINT, config);
  return data.data;
}

export async function getAllModelsVn({
  params,
}: getModelsVnProps): Promise<ModelsVnResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ModelsVnResource[]>(ENDPOINT, config);
  return data;
}

export async function findModelsVnById(id: number): Promise<ModelsVnResource> {
  const response = await api.get<ModelsVnResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeModelsVn(data: any): Promise<ModelsVnResource> {
  const response = await api.post<ModelsVnResource>(ENDPOINT, data);
  return response.data;
}

export async function updateModelsVn(
  id: number,
  data: any
): Promise<ModelsVnResource> {
  const response = await api.put<ModelsVnResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteModelsVn(id: number): Promise<ModelsVnResponse> {
  const { data } = await api.delete<ModelsVnResponse>(`${ENDPOINT}/${id}`);
  return data;
}
