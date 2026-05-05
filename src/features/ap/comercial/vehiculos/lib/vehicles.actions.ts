import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { VEHICLES } from "./vehicles.constants";
import {
  GetVehiclesProps,
  VehicleResource,
  VehicleResponse,
  VehicleRequest,
  VehicleResourceWithCosts,
  VehicleClientDebtInfo,
  VehiclePurchaseOrderData,
  VinMatchResponse,
} from "./vehicles.interface";

const { ENDPOINT } = VEHICLES;

export async function getAllVehicles({
  params,
}: GetVehiclesProps): Promise<VehicleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<VehicleResource[]>(ENDPOINT, config);
  return data;
}

export async function getAllVehiclesWithCosts({
  params,
}: GetVehiclesProps): Promise<VehicleResourceWithCosts[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<VehicleResourceWithCosts[]>(
    `${ENDPOINT}/costs`,
    config
  );
  return data;
}

export async function getVehicles({
  params,
}: GetVehiclesProps): Promise<VehicleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<VehicleResponse>(ENDPOINT, config);
  return data;
}

export async function findVehicleById(id: number): Promise<VehicleResource> {
  const response = await api.get<VehicleResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicle(
  data: VehicleRequest
): Promise<VehicleResource> {
  const response = await api.post<VehicleResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicle(
  id: number,
  data: Partial<VehicleRequest>
): Promise<VehicleResource> {
  const response = await api.put<VehicleResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteVehicle(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getVehicleClientDebtInfo(
  vehicleId: number
): Promise<VehicleClientDebtInfo> {
  const response = await api.get<VehicleClientDebtInfo>(
    `${ENDPOINT}/${vehicleId}/client-debt-info`
  );
  return response.data;
}

export async function matchVins(file: File): Promise<VinMatchResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<VinMatchResponse>(
    `${ENDPOINT}/match-vins`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function getVehiclePurchaseOrder(
  vehicleId: number
): Promise<VehiclePurchaseOrderData> {
  const response = await api.get<VehiclePurchaseOrderData>(
    `${ENDPOINT}/${vehicleId}/purchase-order`
  );
  return response.data;
}
