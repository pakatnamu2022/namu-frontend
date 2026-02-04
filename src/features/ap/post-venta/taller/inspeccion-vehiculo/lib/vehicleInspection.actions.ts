import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getVehicleInspectionProps,
  VehicleInspectionResource,
  VehicleInspectionResponse,
  VehicleInspectionRequest,
} from "./vehicleInspection.interface";
import { VEHICLE_INSPECTION } from "./vehicleInspection.constants";

const { ENDPOINT } = VEHICLE_INSPECTION;

export async function getVehicleInspection({
  params,
}: getVehicleInspectionProps): Promise<VehicleInspectionResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<VehicleInspectionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllVehicleInspection({
  params,
}: getVehicleInspectionProps): Promise<VehicleInspectionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<VehicleInspectionResource[]>(ENDPOINT, config);
  return data;
}

export async function findVehicleInspectionById(
  id: number
): Promise<VehicleInspectionResource> {
  const response = await api.get<VehicleInspectionResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeVehicleInspection(
  data: VehicleInspectionRequest | FormData
): Promise<VehicleInspectionResource> {
  const config: AxiosRequestConfig = {};

  // Si es FormData, configurar headers apropiados
  if (data instanceof FormData) {
    config.headers = {
      "Content-Type": "multipart/form-data",
    };
  }

  const response = await api.post<VehicleInspectionResource>(
    ENDPOINT,
    data,
    config
  );
  return response.data;
}

export async function updateVehicleInspection(
  id: number,
  data: VehicleInspectionRequest | FormData
): Promise<VehicleInspectionResource> {
  const config: AxiosRequestConfig = {};

  // Si es FormData, configurar headers apropiados
  if (data instanceof FormData) {
    config.headers = {
      "Content-Type": "multipart/form-data",
    };
  }

  const response = await api.put<VehicleInspectionResource>(
    `${ENDPOINT}/${id}`,
    data,
    config
  );
  return response.data;
}

export async function deleteVehicleInspection(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function uploadInspectionPhoto(
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post<{ url: string }>(
    `${ENDPOINT}/upload-photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function downloadVehicleInspectionPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/reception-report`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `recepcion-vehiculo-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function downloadOrderReceiptPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/order-receipt`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `orden-recepcion-personal-${id}.pdf`);

  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
