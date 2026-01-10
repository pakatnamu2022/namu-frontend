import type { AxiosRequestConfig } from "axios";
import {
  getVehicleTypeProps,
  VehicleTypeResource,
  VehicleTypeResponse,
} from "./vehicleType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { VEHICLE_TYPE } from "./vehicleType.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

const { ENDPOINT } = VEHICLE_TYPE;

export async function getVehicleType({
  params,
}: getVehicleTypeProps): Promise<VehicleTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.VEHICLE_TYPE,
    },
  };
  const { data } = await api.get<VehicleTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllVehicleType({
  params,
}: getVehicleTypeProps): Promise<VehicleTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.VEHICLE_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<VehicleTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findVehicleTypeById(
  id: number
): Promise<VehicleTypeResource> {
  const response = await api.get<VehicleTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicleType(
  data: any
): Promise<VehicleTypeResource> {
  const response = await api.post<VehicleTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicleType(
  id: number,
  data: any
): Promise<VehicleTypeResource> {
  const response = await api.put<VehicleTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVehicleType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
