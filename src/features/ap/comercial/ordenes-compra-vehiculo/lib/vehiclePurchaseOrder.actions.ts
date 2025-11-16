import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { VEHICLE_PURCHASE_ORDER } from "./vehiclePurchaseOrder.constants";
import {
  GetVehiclePurchaseOrderProps,
  MigrationHistoryResponse,
  MigrationLogsResponse,
  VehiclePurchaseOrderResource,
  VehiclePurchaseOrderResponse,
} from "./vehiclePurchaseOrder.interface";

const { ENDPOINT } = VEHICLE_PURCHASE_ORDER;

export async function getVehiclePurchaseOrder({
  params,
}: GetVehiclePurchaseOrderProps): Promise<VehiclePurchaseOrderResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<VehiclePurchaseOrderResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllVehiclePurchaseOrder({
  params,
}: GetVehiclePurchaseOrderProps): Promise<VehiclePurchaseOrderResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<VehiclePurchaseOrderResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findVehiclePurchaseOrderById(
  id: number
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.get<VehiclePurchaseOrderResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeVehiclePurchaseOrder(
  data: any
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.post<VehiclePurchaseOrderResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehiclePurchaseOrder(
  id: number,
  data: any
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.put<VehiclePurchaseOrderResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVehiclePurchaseOrder(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getMigrationLogs(
  purchaseOrderId: number
): Promise<MigrationLogsResponse> {
  const { data } = await api.get<MigrationLogsResponse>(
    `${ENDPOINT}/migration/${purchaseOrderId}/logs`
  );
  return data;
}

export async function getMigrationHistory(
  purchaseOrderId: number
): Promise<MigrationHistoryResponse> {
  const { data } = await api.get<MigrationHistoryResponse>(
    `${ENDPOINT}/migration/${purchaseOrderId}/history`
  );
  return data;
}

export async function resendVehiclePurchaseOrder(
  id: number,
  data: any
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.post<VehiclePurchaseOrderResource>(
    `${ENDPOINT}/${id}/resend`,
    data
  );
  return response.data;
}
