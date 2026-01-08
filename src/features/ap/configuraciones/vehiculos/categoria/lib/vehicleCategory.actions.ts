import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  getVehicleCategoryProps,
  VehicleCategoryResource,
  VehicleCategoryResponse,
} from "./vehicleCategory.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { VEHICLE_CATEGORY } from "./vehicleCategory.constants";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const { ENDPOINT } = VEHICLE_CATEGORY;

export async function getVehicleCategory({
  params,
}: getVehicleCategoryProps): Promise<VehicleCategoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.VEHICLE_CATEGORY,
    },
  };
  const { data } = await api.get<VehicleCategoryResponse>(ENDPOINT, config);
  return data;
}

export async function findVehicleCategoryById(
  id: number
): Promise<VehicleCategoryResource> {
  const response = await api.get<VehicleCategoryResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicleCategory(
  data: any
): Promise<VehicleCategoryResource> {
  const response = await api.post<VehicleCategoryResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicleCategory(
  id: number,
  data: any
): Promise<VehicleCategoryResource> {
  const response = await api.put<VehicleCategoryResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVehicleCategory(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
