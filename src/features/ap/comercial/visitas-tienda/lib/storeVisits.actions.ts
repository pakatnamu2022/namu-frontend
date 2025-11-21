import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STORE_VISITS } from "./storeVisits.constants";
import {
  getStoreVisitsProps,
  StoreVisitsResource,
  StoreVisitsResponse,
} from "./storeVisits.interface";

const { ENDPOINT } = STORE_VISITS;

export async function getStoreVisits({
  params,
}: getStoreVisitsProps): Promise<StoreVisitsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<StoreVisitsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllStoreVisits({
  params,
}: getStoreVisitsProps): Promise<StoreVisitsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<StoreVisitsResource[]>(ENDPOINT, config);
  return data;
}

export async function findStoreVisitsById(
  id: number
): Promise<StoreVisitsResource> {
  const response = await api.get<StoreVisitsResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeStoreVisits(
  data: any
): Promise<StoreVisitsResource> {
  const response = await api.post<StoreVisitsResource>(ENDPOINT, data);
  return response.data;
}

export async function updateStoreVisits(
  id: number,
  data: any
): Promise<StoreVisitsResource> {
  const response = await api.put<StoreVisitsResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteStoreVisits(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function downloadStoreVisitsFile({
  params,
}: getStoreVisitsProps): Promise<void> {
  if (!params) {
    return;
  }

  const isPDF = params.format === "pdf";

  const config: AxiosRequestConfig = {
    params: {
      type: "VISITA",
      registration_date: params.created_at,
      ...(isPDF && { format: "pdf" }),
    },
    responseType: "blob",
  };

  const response = await api.get(`${ENDPOINT}/export`, config);

  // Determinar el tipo MIME y extensión según el formato
  const mimeType = isPDF
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const extension = isPDF ? "pdf" : "xlsx";

  const blob = new Blob([response.data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Generar nombre de archivo con fechas si están disponibles
  const dateRange = params.created_at
    ? `${params.created_at[0]}_${params.created_at[1]}`
    : new Date().toISOString().split("T")[0];

  link.download = `visitas-tienda-${dateRange}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
