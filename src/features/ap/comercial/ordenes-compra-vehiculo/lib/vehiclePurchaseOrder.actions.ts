import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { VEHICLE_PURCHASE_ORDER } from "./vehiclePurchaseOrder.constants";
import {
  GetVehiclePurchaseOrderProps,
  MigrationHistoryResponse,
  MigrationLogsResponse,
  NextCorrelativeResponse,
  VehiclePurchaseOrderResource,
  VehiclePurchaseOrderResponse,
} from "./vehiclePurchaseOrder.interface";
import { MessageResponse } from "@/core/core.interface";

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
    config,
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
    config,
  );
  return data;
}

export async function findVehiclePurchaseOrderById(
  id: number,
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.get<VehiclePurchaseOrderResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeVehiclePurchaseOrder(
  data: any,
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.post<VehiclePurchaseOrderResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehiclePurchaseOrder(
  id: number,
  data: any,
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.put<VehiclePurchaseOrderResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteVehiclePurchaseOrder(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getMigrationLogs(
  purchaseOrderId: number,
): Promise<MigrationLogsResponse> {
  const { data } = await api.get<MigrationLogsResponse>(
    `${ENDPOINT}/migration/${purchaseOrderId}/logs`,
  );
  return data;
}

export async function getMigrationHistory(
  purchaseOrderId: number,
): Promise<MigrationHistoryResponse> {
  const { data } = await api.get<MigrationHistoryResponse>(
    `${ENDPOINT}/migration/${purchaseOrderId}/history`,
  );
  return data;
}

export async function resendVehiclePurchaseOrder(
  id: number,
  data: any,
): Promise<VehiclePurchaseOrderResource> {
  const response = await api.post<VehiclePurchaseOrderResource>(
    `${ENDPOINT}/${id}/resend`,
    data,
  );
  return response.data;
}

export async function dispatchSyncCreditNote(
  id: number,
): Promise<MessageResponse> {
  const response = await api.get<MessageResponse>(
    `${ENDPOINT}/${id}/dispatchSyncCreditNoteJob`,
  );
  return response.data;
}

export async function dispatchSyncInvoice(
  id: number,
): Promise<MessageResponse> {
  const response = await api.get<MessageResponse>(
    `${ENDPOINT}/${id}/dispatchSyncInvoiceJob`,
  );
  return response.data;
}

export async function dispatchAllVehiclePurchaseOrders(): Promise<void> {
  await api.post(`${ENDPOINT}/migration/dispatch-all`);
}

export async function dispatchVehiclePurchaseOrderMigration(id: number): Promise<void> {
  await api.post(`${ENDPOINT}/migration/${id}/dispatch-migration`);
}

export async function getNextCorrelative(
  sedeId: number,
  typeOperationId: number,
): Promise<NextCorrelativeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      sede_id: sedeId,
      type_operation_id: typeOperationId,
    },
  };
  const { data } = await api.get<NextCorrelativeResponse>(
    `${ENDPOINT}/next-correlative`,
    config,
  );
  return data;
}
