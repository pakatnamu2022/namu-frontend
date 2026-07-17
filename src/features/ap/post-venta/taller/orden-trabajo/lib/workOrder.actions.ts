import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getWorkOrderProps,
  WorkOrderResource,
  WorkOrderResponse,
  WorkOrderRequest,
  VehicleWorkOrderHistoryResponse,
  GenerateWorkOrderResponse,
  StoreWorkOrderDeductibleRequest,
  WorkOrderDigitalFileResource,
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

export async function exportWorkOrder({
  params,
}: getWorkOrderProps): Promise<void> {
  const config: AxiosRequestConfig = {
    params,
    responseType: "blob",
  };

  const response = await api.get(`${ENDPOINT}/export`, config);

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ordenes-trabajo-${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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

export async function storeWorkOrderDeductible(
  data: StoreWorkOrderDeductibleRequest,
): Promise<WorkOrderResource> {
  const response = await api.post<WorkOrderResource>(
    `${ENDPOINT}/deductible`,
    data,
  );
  return response.data;
}

export async function deleteWorkOrderDeductible(
  deductibleId: number,
): Promise<WorkOrderResource> {
  const response = await api.delete<WorkOrderResource>(
    `${ENDPOINT}/deductible/${deductibleId}`,
  );
  return response.data;
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
): Promise<GenerateWorkOrderResponse> {
  const response = await api.post<GenerateWorkOrderResponse>(
    `${ENDPOINT}/${id}/generate-internal-note`,
  );
  return response.data;
}

export async function generateDelivery(
  id: number,
  data: FormData,
): Promise<WorkOrderResource> {
  const response = await api.post<WorkOrderResource>(
    `${ENDPOINT}/${id}/generate-delivery`,
    data,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function generatePDIForVehicle(
  id: number, // ID del vehículo
): Promise<GenerateWorkOrderResponse> {
  const response = await api.post<GenerateWorkOrderResponse>(
    `${ENDPOINT}/generate-pdi/${id}`,
  );
  return response.data;
}

export async function generateInstAccessoriesForVehicle(
  id: number, // ID del vehículo
): Promise<GenerateWorkOrderResponse> {
  const response = await api.post<GenerateWorkOrderResponse>(
    `${ENDPOINT}/generate-inst-accessories/${id}`,
  );
  return response.data;
}

export async function changeCurrency(
  id: number,
  currencyId: number,
): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/change-currency`,
    { currency_id: currencyId },
  );
  return response.data;
}

export async function changeAdvisor(
  id: number,
  advisorId: number,
): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/change-advisor`,
    { advisor_id: advisorId },
  );
  return response.data;
}

export async function recalculateTotals(
  id: number,
): Promise<WorkOrderResource> {
  const response = await api.post<WorkOrderResource>(
    `${ENDPOINT}/${id}/recalculate-totals`,
  );
  return response.data;
}

export async function sendToFinished(id: number): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/send-finished`,
  );
  return response.data;
}

export async function revertFinished(id: number): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/revertir`,
  );
  return response.data;
}

export interface CancelWorkOrderData {
  discard_reason_id: number;
  discarded_note?: string | null;
}

export async function cancelWorkOrder(
  id: number,
  data: CancelWorkOrderData,
): Promise<GeneralResponse> {
  const response = await api.patch<GeneralResponse>(
    `${ENDPOINT}/${id}/cancel`,
    data,
  );
  return response.data;
}

export interface UpdatePickupPersonData {
  num_doc_pickup: string;
  full_pickup_name: string;
  phone_pickup: string;
}

export async function updatePickupPerson(
  id: number,
  data: UpdatePickupPersonData,
): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${id}/update-pickup-person`,
    data,
  );
  return response.data;
}

export interface UpdateWorkOrderItemData {
  id: number;
  type_planning_id: number;
  type_operation_id: number;
  description: string;
}

export async function updateWorkOrderItems(
  workOrderId: number,
  data: UpdateWorkOrderItemData,
): Promise<WorkOrderResource> {
  const response = await api.patch<WorkOrderResource>(
    `${ENDPOINT}/${workOrderId}/update-items`,
    data,
  );
  return response.data;
}

export async function getWorkOrderDocuments(
  id: number,
): Promise<WorkOrderDigitalFileResource[]> {
  const { data } = await api.get<WorkOrderDigitalFileResource[]>(
    `${ENDPOINT}/${id}/documents`,
  );
  return data;
}

export async function uploadWorkOrderDocuments(
  id: number,
  files: File[],
): Promise<WorkOrderDigitalFileResource[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files[]", file));
  const { data } = await api.post<WorkOrderDigitalFileResource[]>(
    `${ENDPOINT}/${id}/documents`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
