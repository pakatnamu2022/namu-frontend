import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getWorkOrderItemProps,
  WorkOrderItemRequest,
  WorkOrderItemResource,
  WorkOrderItemResponse,
} from "./workOrderItem.interface";
import { WORKER_ORDER_ITEM } from "./workOrderItem.constants";

const { ENDPOINT } = WORKER_ORDER_ITEM;

export async function getWorkOrderItem({
  params,
}: getWorkOrderItemProps): Promise<WorkOrderItemResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<WorkOrderItemResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkOrderItem({
  params,
}: getWorkOrderItemProps): Promise<WorkOrderItemResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WorkOrderItemResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkOrderItemById(
  id: number
): Promise<WorkOrderItemResource> {
  const response = await api.get<WorkOrderItemResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWorkOrderItem(
  data: WorkOrderItemRequest
): Promise<WorkOrderItemResource> {
  const response = await api.post<WorkOrderItemResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkOrderItem(
  id: number,
  data: WorkOrderItemRequest
): Promise<WorkOrderItemResource> {
  const response = await api.put<WorkOrderItemResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteWorkOrderItem(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function downloadWorkOrderItemPdf(id: number): Promise<void> {
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
