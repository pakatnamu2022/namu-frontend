import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getWorkOrderProps,
  WorkOrderResource,
  WorkOrderResponse,
  WorkOrderRequest,
} from "./workOrder.interface";
import { WORKER_ORDER } from "./workOrder.constants";

const { ENDPOINT } = WORKER_ORDER;

export async function getWorkOrder({
  params,
}: getWorkOrderProps): Promise<WorkOrderResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<WorkOrderResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkOrder({
  params,
}: getWorkOrderProps): Promise<WorkOrderResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WorkOrderResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkOrderById(
  id: number
): Promise<WorkOrderResource> {
  const response = await api.get<WorkOrderResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWorkOrder(
  data: WorkOrderRequest
): Promise<WorkOrderResource> {
  const response = await api.post<WorkOrderResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkOrder(
  id: number,
  data: WorkOrderRequest
): Promise<WorkOrderResource> {
  const response = await api.put<WorkOrderResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWorkOrder(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function downloadWorkOrderPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `orden-trabajo-${id}.pdf`);

  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
