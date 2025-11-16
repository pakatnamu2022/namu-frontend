import { AxiosRequestConfig } from "axios";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { PURCHASE_REQUEST_QUOTE } from "./purchaseRequestQuote.constants";
import {
  ConceptDiscountBondResource,
  getPurchaseRequestQuoteProps,
  PurchaseRequestQuoteResource,
  PurchaseRequestQuoteResponse,
} from "./purchaseRequestQuote.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../lib/ap.constants";

const { ENDPOINT } = PURCHASE_REQUEST_QUOTE;

export async function getPurchaseRequestQuote({
  params,
}: getPurchaseRequestQuoteProps): Promise<PurchaseRequestQuoteResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PurchaseRequestQuoteResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllPurchaseRequestQuote({
  params,
}: getPurchaseRequestQuoteProps): Promise<PurchaseRequestQuoteResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<PurchaseRequestQuoteResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllConceptDiscountBond({
  params,
}: getPurchaseRequestQuoteProps): Promise<ConceptDiscountBondResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
      type: "CONCEPT_DISCOUNT_BOND",
    },
  };
  const { data } = await api.get<ConceptDiscountBondResource[]>(
    COMMERCIAL_MASTERS_ENDPOINT,
    config
  );
  return data;
}

export async function findPurchaseRequestQuoteById(
  id: number
): Promise<PurchaseRequestQuoteResource> {
  const response = await api.get<PurchaseRequestQuoteResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storePurchaseRequestQuote(
  data: any
): Promise<PurchaseRequestQuoteResource> {
  const response = await api.post<PurchaseRequestQuoteResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePurchaseRequestQuote(
  id: number,
  data: any
): Promise<PurchaseRequestQuoteResource> {
  const response = await api.put<PurchaseRequestQuoteResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePurchaseRequestQuote(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function approvePurchaseRequestQuote(
  id: number
): Promise<PurchaseRequestQuoteResource> {
  const response = await api.put<PurchaseRequestQuoteResource>(
    `${ENDPOINT}/${id}`,
    { is_approved: 1 }
  );
  return response.data;
}

export async function downloadPurchaseRequestQuotePdf(
  id: number
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/pdf/${id}`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `solicitud-cotizacion-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function assignVehicleToPurchaseRequestQuote(
  id: number,
  ap_vehicle_id: number
): Promise<PurchaseRequestQuoteResource> {
  const response = await api.post<PurchaseRequestQuoteResource>(
    `${ENDPOINT}/assignVehicle/${id}`,
    { ap_vehicle_id }
  );
  return response.data;
}

export async function unassignVehicleFromPurchaseRequestQuote(
  id: number
): Promise<PurchaseRequestQuoteResource> {
  const response = await api.post<PurchaseRequestQuoteResource>(
    `${ENDPOINT}/unassignVehicle/${id}`
  );
  return response.data;
}
