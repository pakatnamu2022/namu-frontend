import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { CONTROL_UNITS } from "./controlUnits.constants";
import {
  getControlUnitsProps,
  ReceptionChecklistRequest,
  ReceptionChecklistResponse,
  ControlUnitsRequest,
  ControlUnitsResource,
  ControlUnitsResponse,
} from "./controlUnits.interface";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import {
  SendToNubefactResponse,
  QueryFromNubefactResponse,
} from "../../envios-recepciones/lib/shipmentsReceptions.interface";

const { ENDPOINT } = CONTROL_UNITS;

export async function getControlUnits({
  params,
}: getControlUnitsProps): Promise<ControlUnitsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ControlUnitsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllControlUnits({
  params,
}: getControlUnitsProps): Promise<ControlUnitsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<ControlUnitsResource[]>(ENDPOINT, config);
  return data;
}

export async function getControlUnitsById(
  id: number
): Promise<ControlUnitsResource> {
  const { data } = await api.get<ControlUnitsResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findControlUnitsById(
  id: number
): Promise<ControlUnitsResource> {
  const response = await api.get<ControlUnitsResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeControlUnits(
  payload: ControlUnitsRequest
): Promise<ControlUnitsResource> {
  const { data } = await api.post<ControlUnitsResource>(`${ENDPOINT}/consignment`, payload);
  return data;
}

export async function updateControlUnits(
  id: number,
  payload: ControlUnitsRequest
): Promise<ControlUnitsResource> {
  const { data } = await api.post<ControlUnitsResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteControlUnits(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

// Funciones para checklist de recepción
const CHECKLIST_ENDPOINT = "/ap/commercial/receivingChecklist";

export async function getReceptionChecklistById(
  id: number
): Promise<ReceptionChecklistResponse> {
  const { data } = await api.get<ReceptionChecklistResponse>(
    `${CHECKLIST_ENDPOINT}/byShippingGuide/${id}`
  );
  return data;
}

export async function getVehicleByShippingGuide(
  shippingGuideId: number
): Promise<VehicleResource> {
  const { data } = await api.get<VehicleResource>(
    `${CHECKLIST_ENDPOINT}/byShippingGuide/${shippingGuideId}/vehicle`
  );
  return data;
}

export async function updateReceptionChecklist(
  id: number,
  payload: ReceptionChecklistRequest
): Promise<ReceptionChecklistResponse> {
  const { data } = await api.put<ReceptionChecklistResponse>(
    `${CHECKLIST_ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteReceptionChecklist(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `${CHECKLIST_ENDPOINT}/${id}`
  );
  return data;
}

// Función para marcar como recibido (solo para traslado entre almacenes)
export async function markAsReceived(
  id: number,
  note_received?: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/ap/commercial/shippingGuides/${id}/mark-as-received`,
    { note_received }
  );
  return data;
}

// Función para crear guía de consignación
export async function storeConsignment(
  payload: ControlUnitsRequest
): Promise<ControlUnitsResource> {
  const { data } = await api.post<ControlUnitsResource>(
    `${ENDPOINT}/consignment`,
    payload
  );
  return data;
}

// Función para cancelar guía de remisión
export async function cancelShippingGuide(
  id: number,
  cancellation_reason: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/ap/commercial/shippingGuides/${id}/cancel`,
    { cancellation_reason }
  );
  return data;
}

// Funciones SUNAT / Dynamic
export async function sendControlUnitsToNubefact(
  id: number
): Promise<SendToNubefactResponse> {
  const { data } = await api.post<SendToNubefactResponse>(
    `${ENDPOINT}/${id}/send-to-nubefact`
  );
  return data;
}

export async function queryControlUnitsFromNubefact(
  id: number
): Promise<QueryFromNubefactResponse> {
  const { data } = await api.post<QueryFromNubefactResponse>(
    `${ENDPOINT}/${id}/query-from-nubefact`
  );
  return data;
}

export async function sendControlUnitsToDynamic(
  id: number
): Promise<SendToNubefactResponse> {
  const { data } = await api.post<SendToNubefactResponse>(
    `${ENDPOINT}/${id}/send-to-dynamic`
  );
  return data;
}
