import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getParametersProps,
  ParameterResource,
  ParameterResponse,
} from "./parameter.interface";
import { PARAMETER } from "./parameter.constans";

const { ENDPOINT } = PARAMETER;

export async function getParameter({
  params,
}: getParametersProps): Promise<ParameterResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ParameterResponse>(ENDPOINT, config);
  return data;
}

export async function getAllParameters({
  params,
}: getParametersProps): Promise<ParameterResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all parameters
      ...params,
    },
  };
  const { data } = await api.get<ParameterResource[]>(ENDPOINT, config);
  return data;
}

export async function findParameterById(
  id: string
): Promise<ParameterResource> {
  const response = await api.get<ParameterResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeParameter(data: any): Promise<ParameterResponse> {
  const response = await api.post<ParameterResponse>(`${ENDPOINT}`, data);
  return response.data;
}

export async function updateParameter(
  id: string,
  data: any
): Promise<ParameterResponse> {
  const response = await api.put<ParameterResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteParameter(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
