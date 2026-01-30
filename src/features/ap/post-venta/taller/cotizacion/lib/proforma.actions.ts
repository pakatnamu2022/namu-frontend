import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getOrderQuotationProps,
  OrderQuotationRequest,
  OrderQuotationResource,
  OrderQuotationResponse,
} from "./proforma.interface";
import { ORDER_QUOTATION_TALLER } from "./proforma.constants";

const { ENDPOINT } = ORDER_QUOTATION_TALLER;

export async function getOrderQuotations({
  params,
}: getOrderQuotationProps): Promise<OrderQuotationResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<OrderQuotationResponse>(ENDPOINT, config);
  return data;
}

export async function getAllOrderQuotations(
  params?: Record<string, any>,
): Promise<OrderQuotationResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<OrderQuotationResource[]>(ENDPOINT, config);
  return data;
}

export async function findOrderQuotationById(
  id: number,
): Promise<OrderQuotationResource> {
  const response = await api.get<OrderQuotationResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeOrderQuotation(
  data: OrderQuotationRequest,
): Promise<OrderQuotationResource> {
  const response = await api.post<OrderQuotationResource>(ENDPOINT, data);
  return response.data;
}

export async function updateOrderQuotation(
  id: number,
  data: OrderQuotationRequest,
): Promise<OrderQuotationResource> {
  const response = await api.put<OrderQuotationResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteOrderQuotation(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function downloadOrderQuotationPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `cotizacion-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function downloadOrderQuotationRepuestoPdf(
  id: number,
  show_codes: boolean,
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf-repuesto`, {
    responseType: "blob",
    params: {
      show_codes: show_codes,
    },
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `cotizacion-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
