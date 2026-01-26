import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getPurchaseRequestProps,
  PurchaseRequestDetailResponse,
  PurchaseRequestRequest,
  PurchaseRequestResource,
  PurchaseRequestResponse,
} from "./purchaseRequest.interface";
import { PURCHASE_REQUEST } from "./purchaseRequest.constants";

const { ENDPOINT } = PURCHASE_REQUEST;

export async function getPurchaseRequests({
  params,
}: getPurchaseRequestProps): Promise<PurchaseRequestResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PurchaseRequestResponse>(ENDPOINT, config);
  return data;
}

export async function getPurchaseRequestsDetailsPending({
  params,
}: getPurchaseRequestProps): Promise<PurchaseRequestDetailResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PurchaseRequestDetailResponse>(
    `${ENDPOINT}/pending-details`,
    config,
  );
  return data;
}

export async function getAllPurchaseRequests({
  params,
}: getPurchaseRequestProps): Promise<PurchaseRequestResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<PurchaseRequestResource[]>(ENDPOINT, config);
  return data;
}

export async function findPurchaseRequestById(
  id: number,
): Promise<PurchaseRequestResource> {
  const response = await api.get<PurchaseRequestResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePurchaseRequest(
  data: PurchaseRequestRequest,
): Promise<PurchaseRequestResource> {
  const response = await api.post<PurchaseRequestResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePurchaseRequest(
  id: number,
  data: PurchaseRequestRequest,
): Promise<PurchaseRequestResource> {
  const response = await api.put<PurchaseRequestResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deletePurchaseRequest(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function rejectPurchaseRequestDetail(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.patch<GeneralResponse>(
    `${ENDPOINT}/details/${id}/reject`,
  );
  return data;
}

export async function downloadPurchaseRequestPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `solicitud-compra-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
