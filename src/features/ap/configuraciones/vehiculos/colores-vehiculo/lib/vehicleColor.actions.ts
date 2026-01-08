import type { AxiosRequestConfig } from "axios";
import {
  getVehicleColorProps,
  VehicleColorResource,
  VehicleColorResponse,
} from "./vehicleColor.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { VEHICLE_COLOR } from "./vehicleColor.constants";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const { ENDPOINT } = VEHICLE_COLOR;

export async function getVehicleColor({
  params,
}: getVehicleColorProps): Promise<VehicleColorResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.VEHICLE_COLOR,
    },
  };
  const { data } = await api.get<VehicleColorResponse>(ENDPOINT, config);
  return data;
}

export async function getAllVehicleColor({
  params,
}: getVehicleColorProps): Promise<VehicleColorResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      type: AP_MASTER_TYPE.VEHICLE_COLOR,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<VehicleColorResource[]>(ENDPOINT, config);
  return data;
}

export async function findVehicleColorById(
  id: number
): Promise<VehicleColorResource> {
  const response = await api.get<VehicleColorResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicleColor(
  data: any
): Promise<VehicleColorResource> {
  const response = await api.post<VehicleColorResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicleColor(
  id: number,
  data: any
): Promise<VehicleColorResource> {
  const response = await api.put<VehicleColorResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVehicleColor(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
