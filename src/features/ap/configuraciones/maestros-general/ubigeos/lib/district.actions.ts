import { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { DISTRICT } from "./district.constants";
import {
  DistrictResource,
  DistrictResponse,
  getDistrictProps,
} from "./district.interface";

const { ENDPOINT } = DISTRICT;

export async function getDistrict({
  params,
}: getDistrictProps): Promise<DistrictResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<DistrictResponse>(ENDPOINT, config);
  return data;
}

export async function getAllDistrict({
  params,
}: getDistrictProps): Promise<DistrictResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<DistrictResource[]>(ENDPOINT, config);
  return data;
}

export async function findDistrictById(id: number): Promise<DistrictResource> {
  const response = await api.get<DistrictResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeDistrict(data: any): Promise<DistrictResource> {
  const response = await api.post<DistrictResource>(ENDPOINT, data);
  return response.data;
}

export async function updateDistrict(
  id: number,
  data: any
): Promise<DistrictResource> {
  const response = await api.put<DistrictResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteDistrict(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
