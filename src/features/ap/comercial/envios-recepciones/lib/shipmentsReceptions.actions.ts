import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { SHIPMENTS_RECEPTIONS } from "./shipmentsReceptions.constants";
import {
  getShipmentsReceptionsProps,
  QueryFromNubefactResponse,
  ReceptionChecklistRequest,
  ReceptionChecklistResponse,
  SendToNubefactResponse,
  ShipmentsReceptionsRequest,
  ShipmentsReceptionsResource,
  ShipmentsReceptionsResponse,
} from "./shipmentsReceptions.interface";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";

const { ENDPOINT } = SHIPMENTS_RECEPTIONS;

export async function getShipmentsReceptions({
  params,
}: getShipmentsReceptionsProps): Promise<ShipmentsReceptionsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ShipmentsReceptionsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllShipmentsReceptions({
  params,
}: getShipmentsReceptionsProps): Promise<ShipmentsReceptionsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<ShipmentsReceptionsResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getShipmentsReceptionsById(
  id: number
): Promise<ShipmentsReceptionsResource> {
  const { data } = await api.get<ShipmentsReceptionsResource>(
    `${ENDPOINT}/${id}`
  );
  return data;
}

export async function findShipmentsReceptionsById(
  id: number
): Promise<ShipmentsReceptionsResource> {
  const response = await api.get<ShipmentsReceptionsResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeShipmentsReceptions(
  payload: ShipmentsReceptionsRequest
): Promise<ShipmentsReceptionsResource> {
  const { data } = await api.post<ShipmentsReceptionsResource>(
    ENDPOINT,
    payload
  );
  return data;
}

export async function updateShipmentsReceptions(
  id: number,
  payload: ShipmentsReceptionsRequest
): Promise<ShipmentsReceptionsResource> {
  const { data } = await api.post<ShipmentsReceptionsResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteShipmentsReceptions(
  id: number
): Promise<GeneralResponse> {
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

// Función para enviar a Nubefact
export async function sendShippingGuideToNubefact(
  id: number
): Promise<SendToNubefactResponse> {
  const { data } = await api.post<SendToNubefactResponse>(
    `/ap/commercial/shippingGuides/${id}/send-to-nubefact`
  );
  return data;
}

// Función para consultar el estado en Nubefact
export async function queryShippingGuideFromNubefact(
  id: number
): Promise<QueryFromNubefactResponse> {
  const { data } = await api.post<QueryFromNubefactResponse>(
    `/ap/commercial/shippingGuides/${id}/query-from-nubefact`
  );
  return data;
}

// Función para obtener logs de la guía
export async function getShippingGuideLogs(id: number): Promise<any> {
  const { data } = await api.get<any>(
    `/ap/commercial/shippingGuides/${id}/logs`
  );
  return data;
}

// Función para obtener historial de la guía
export async function getShippingGuideHistory(id: number): Promise<any> {
  const { data } = await api.get<any>(
    `/ap/commercial/shippingGuides/${id}/history`
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
