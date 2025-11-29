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
  // TODO: Reemplazar con llamada real a la API cuando esté disponible
  // const config: AxiosRequestConfig = { params };
  // const { data } = await api.get<AvailableSlotsResponse[]>(`${ENDPOINT}/available-slots`, config);
  // return data;

  // Mock data por ahora
  return generateMockSlots(params.start_date, params.end_date);
}

// Función helper para generar slots mock (remover cuando API esté lista)
function generateMockSlots(startDate: string, endDate: string): AvailableSlotsResponse[] {
  const slots: AvailableSlotsResponse[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Horario de trabajo: 8:00 AM - 6:00 PM
  const workStart = 8;
  const workEnd = 18;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const daySlots: AvailableSlotsResponse = {
      date: dateStr,
      slots: [],
    };

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Simular algunos slots ocupados aleatoriamente
        const isAvailable = Math.random() > 0.3; // 70% disponibles

        daySlots.slots.push({
          date: dateStr,
          time: timeStr,
          available: isAvailable,
          appointment_id: isAvailable ? undefined : Math.floor(Math.random() * 100),
        });
      }
    }

    slots.push(daySlots);
  }

  return slots;
}
