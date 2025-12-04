import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getAppointmentPlanningProps,
  AppointmentPlanningResource,
  AppointmentPlanningResponse,
  AppointmentPlanningRequest,
  AvailableSlotsResponse,
  GetAvailableSlotsParams,
} from "./appointmentPlanning.interface";
import { APPOINTMENT_PLANNING } from "./appointmentPlanning.constants";

const { ENDPOINT } = APPOINTMENT_PLANNING;

export async function getAppointmentPlanning({
  params,
}: getAppointmentPlanningProps): Promise<AppointmentPlanningResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<AppointmentPlanningResponse>(ENDPOINT, config);
  return data;
}

export async function getAllAppointmentPlanning({
  params,
}: getAppointmentPlanningProps): Promise<AppointmentPlanningResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<AppointmentPlanningResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findAppointmentPlanningById(
  id: number
): Promise<AppointmentPlanningResource> {
  const response = await api.get<AppointmentPlanningResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAppointmentPlanning(
  data: AppointmentPlanningRequest
): Promise<AppointmentPlanningResource> {
  const response = await api.post<AppointmentPlanningResource>(ENDPOINT, data);
  return response.data;
}

export async function updateAppointmentPlanning(
  id: number,
  data: AppointmentPlanningRequest
): Promise<AppointmentPlanningResource> {
  const response = await api.put<AppointmentPlanningResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteAppointmentPlanning(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

// Función para obtener slots disponibles (mock por ahora, luego será reemplazada por API real)
export async function getAvailableSlots(
  params: GetAvailableSlotsParams
): Promise<AvailableSlotsResponse[]> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<AvailableSlotsResponse[]>(
    `${ENDPOINT}/available-slots`,
    config
  );
  return data;
}

export async function downloadAppointmentPlanningPdf(
  id: number
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  // Crear un blob desde la respuesta
  const blob = new Blob([response.data], { type: "application/pdf" });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `cita-planificacion-${id}.pdf`);

  // Hacer clic automáticamente para iniciar la descarga
  document.body.appendChild(link);
  link.click();

  // Limpiar
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
