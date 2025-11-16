import { AxiosRequestConfig } from "axios";
import {
  getVehicleStatusProps,
  VehicleStatusResource,
  VehicleStatusResponse,
} from "./vehicleStatus.interface";
import { api } from "@/src/core/api";
import { VEHICLE_STATUS } from "./vehicleStatus.constants";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";

const { ENDPOINT } = VEHICLE_STATUS;

export async function getVehicleStatus({
  params,
}: getVehicleStatusProps): Promise<VehicleStatusResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<VehicleStatusResponse>(ENDPOINT, config);
  return data;
}

export async function getAllVehicleStatus({
  params,
}: getVehicleStatusProps): Promise<VehicleStatusResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<VehicleStatusResource[]>(ENDPOINT, config);
  return data;
}

export async function findVehicleStatusById(
  id: number
): Promise<VehicleStatusResource> {
  const response = await api.get<VehicleStatusResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicleStatus(
  data: any
): Promise<VehicleStatusResource> {
  const response = await api.post<VehicleStatusResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicleStatus(
  id: number,
  data: any
): Promise<VehicleStatusResource> {
  const response = await api.put<VehicleStatusResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVehicleStatus(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
