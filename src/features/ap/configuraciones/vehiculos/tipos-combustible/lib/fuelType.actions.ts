import type { AxiosRequestConfig } from "axios";
import {
  FuelTypeResource,
  FuelTypeResponse,
  getFuelTypeProps,
} from "./fuelType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { FUEL_TYPE } from "./fuelType.constants";

const { ENDPOINT } = FUEL_TYPE;

export async function getFuelType({
  params,
}: getFuelTypeProps): Promise<FuelTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<FuelTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllFuelType({
  params,
}: getFuelTypeProps): Promise<FuelTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<FuelTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findFuelTypeById(id: number): Promise<FuelTypeResource> {
  const response = await api.get<FuelTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeFuelType(data: any): Promise<FuelTypeResource> {
  const response = await api.post<FuelTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateFuelType(
  id: number,
  data: any
): Promise<FuelTypeResource> {
  const response = await api.put<FuelTypeResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteFuelType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
