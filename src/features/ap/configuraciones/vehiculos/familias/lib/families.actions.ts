import { AxiosRequestConfig } from "axios";
import {
  FamiliesResource,
  FamiliesResponse,
  getFamiliesProps,
} from "./families.interface";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { FAMILIES } from "./families.constants";

const { ENDPOINT } = FAMILIES;

export async function getFamilies({
  params,
}: getFamiliesProps): Promise<FamiliesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<FamiliesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllFamilies({
  params,
}: getFamiliesProps): Promise<FamiliesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<FamiliesResource[]>(ENDPOINT, config);
  return data;
}

export async function findFamiliesById(id: number): Promise<FamiliesResource> {
  const response = await api.get<FamiliesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeFamilies(data: any): Promise<FamiliesResource> {
  const response = await api.post<FamiliesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateFamilies(
  id: number,
  data: any
): Promise<FamiliesResource> {
  const response = await api.put<FamiliesResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteFamilies(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
