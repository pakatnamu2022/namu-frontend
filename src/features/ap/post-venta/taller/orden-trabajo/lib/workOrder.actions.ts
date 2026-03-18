import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getWorkOrderProps,
  WorkOrderResource,
  WorkOrderResponse,
  WorkOrderRequest,
  WorkOrderPaymentSummary,
  VehicleWorkOrderHistoryResponse,
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

export async function getWorkOrderWithInternalNotes({
  params,
}: getWorkOrderProps): Promise<WorkOrderResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<WorkOrderResponse>(
    `${ENDPOINT}/with-internal-notes`,
    config,
  );
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
  id: number,
): Promise<WorkOrderResource> {
  const response = await api.get<WorkOrderResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function findWorkOrdersByIds(
  ids: number[],
): Promise<WorkOrderResource[]> {
  const response = await api.post<WorkOrderResource[]>(`${ENDPOINT}/by-ids`, {
    ids,
  });
  return response.data;
}

export async function storeWorkOrder(
  data: WorkOrderRequest,
): Promise<WorkOrderResource> {
  const response = await api.post<WorkOrderResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkOrder(
  id: number,
  data: WorkOrderRequest,
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

export async function getPaymentSummary(
  id: number,
  groupNumber?: number,
): Promise<WorkOrderPaymentSummary> {
  const config: AxiosRequestConfig = {
    params: groupNumber ? { group_number: groupNumber } : {},
  };
  const { data } = await api.get<WorkOrderPaymentSummary>(
    `${ENDPOINT}/${id}/payment-summary`,
    config,
  );
  return data;
}

export async function downloadPreLiquidationPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pre-liquidation`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `pre-liquidacion-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function getVehicleWorkOrderHistory(
  vehicleId: number,
): Promise<VehicleWorkOrderHistoryResponse> {
  const { data } = await api.get<VehicleWorkOrderHistoryResponse>(
    `${ENDPOINT}/vehicle/${vehicleId}/history`,
  );
  return data;
}

export async function unlinkQuotation(id: number): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/unlink-quotation`,
  );
  return response.data;
}

export async function updateInvoiceTo(
  id: number,
  invoiceToId: number | null,
): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/invoice-to`,
    { invoice_to: invoiceToId },
  );
  return response.data;
}

export async function downloadDeliveryPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/delivery-report`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `reporte-entrega-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function generateInternalNote(
  id: number,
): Promise<WorkOrderResource> {
  const response = await api.post<WorkOrderResource>(
    `${ENDPOINT}/${id}/generate-internal-note`,
  );
  return response.data;
}
