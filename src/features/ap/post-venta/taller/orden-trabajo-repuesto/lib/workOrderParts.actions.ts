import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getWorkOrderPartsProps,
  WorkOrderPartsRequest,
  WorkOrderPartsResource,
  WorkOrderPartsResponse,
  StoreBulkFromQuotationRequest,
  WorkOrderPartAssignmentsResponse,
  ConfirmPartsDeliveryRequest,
  WorkOrderPartDeliveryResource,
} from "./workOrderParts.interface";
import { WORKER_ORDER_PARTS } from "./workOrderParts.constants";

const { ENDPOINT } = WORKER_ORDER_PARTS;

export async function getWorkOrderParts({
  params,
}: getWorkOrderPartsProps): Promise<WorkOrderPartsResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<WorkOrderPartsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkOrderParts({
  params,
}: getWorkOrderPartsProps): Promise<WorkOrderPartsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WorkOrderPartsResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkOrderPartsById(
  id: number,
): Promise<WorkOrderPartsResource> {
  const response = await api.get<WorkOrderPartsResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWorkOrderParts(
  data: WorkOrderPartsRequest,
): Promise<WorkOrderPartsResource> {
  const response = await api.post<WorkOrderPartsResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkOrderParts(
  id: number,
  data: WorkOrderPartsRequest,
): Promise<WorkOrderPartsResource> {
  const response = await api.put<WorkOrderPartsResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteWorkOrderParts(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeBulkFromQuotation(
  payload: StoreBulkFromQuotationRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/store-bulk-from-quotation`,
    payload,
  );
  return data;
}

export async function getWorkOrderPartsDeliveriesById(
  workOrderPartId: number,
): Promise<WorkOrderPartDeliveryResource[]> {
  const { data } = await api.get<WorkOrderPartDeliveryResource[]>(
    `${ENDPOINT}/${workOrderPartId}/deliveries`,
  );
  return data;
}

export async function assignPartToTechnician(
  id: number,
  payload: { delivered_to: number; delivered_quantity: number },
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${id}/assign`,
    payload,
  );
  return data;
}

export async function getAssignmentsByWorkOrder(
  workOrderId: number,
  workerId: number,
): Promise<WorkOrderPartAssignmentsResponse> {
  const { data } = await api.get<WorkOrderPartAssignmentsResponse>(
    `${ENDPOINT}/work-order/${workOrderId}/assignments`,
    { params: { delivered_to: workerId } },
  );
  return data;
}

export async function confirmPartsDelivery(
  payload: ConfirmPartsDeliveryRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/confirm-receipt`,
    payload,
  );
  return data;
}
