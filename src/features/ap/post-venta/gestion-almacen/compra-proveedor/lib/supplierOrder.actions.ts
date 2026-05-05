import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { SUPPLIER_ORDER } from "./supplierOrder.constants.ts";
import {
  getSupplierOrderProps,
  SupplierOrderDetailsResource,
  SupplierOrderRequest,
  SupplierOrderResource,
  SupplierOrderResponse,
} from "./supplierOrder.interface.ts";

const { ENDPOINT } = SUPPLIER_ORDER;

export async function getSupplierOrder(
  params?: Record<string, any>,
): Promise<SupplierOrderResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<SupplierOrderResponse>(ENDPOINT, config);
  return data;
}

export async function getAllSupplierOrder({
  params,
}: getSupplierOrderProps): Promise<SupplierOrderResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<SupplierOrderResource[]>(ENDPOINT, config);
  return data;
}

export async function getSupplierOrderById(
  id: number,
): Promise<SupplierOrderResource> {
  const { data } = await api.get<SupplierOrderResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findSupplierOrderById(
  id: number,
): Promise<SupplierOrderResource> {
  const response = await api.get<SupplierOrderResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function pendingProductsById(
  id: number,
): Promise<SupplierOrderDetailsResource[]> {
  const response = await api.get<SupplierOrderDetailsResource[]>(
    `${ENDPOINT}/${id}/pending-products`,
  );
  return response.data;
}

export async function storeSupplierOrder(
  payload: SupplierOrderRequest,
): Promise<SupplierOrderResource> {
  const { data } = await api.post<SupplierOrderResource>(ENDPOINT, payload);
  return data;
}

export async function updateSupplierOrder(
  id: number,
  payload: Partial<SupplierOrderRequest>,
): Promise<SupplierOrderResource> {
  const { data } = await api.put<SupplierOrderResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteSupplierOrder(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function approveSupplierOrder(
  id: number,
): Promise<SupplierOrderResource> {
  const { data } = await api.put<SupplierOrderResource>(
    `${ENDPOINT}/${id}/approve`,
    {},
  );
  return data;
}

export async function downloadSupplierOrderPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `orden-compra-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
