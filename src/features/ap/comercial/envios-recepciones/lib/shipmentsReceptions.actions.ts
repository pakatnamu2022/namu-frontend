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
  const formData = new FormData();

  formData.append("shipping_guide_id", payload.shipping_guide_id);
  formData.append("kilometers", payload.kilometers);

  if (payload.note) formData.append("note", payload.note);
  if (payload.general_observations)
    formData.append("general_observations", payload.general_observations);

  if (payload.photo_front instanceof File)
    formData.append("photo_front", payload.photo_front);
  if (payload.photo_back instanceof File)
    formData.append("photo_back", payload.photo_back);
  if (payload.photo_left instanceof File)
    formData.append("photo_left", payload.photo_left);
  if (payload.photo_right instanceof File)
    formData.append("photo_right", payload.photo_right);

  // items_receiving: solo los IDs seleccionados como array de enteros
  Object.keys(payload.items_receiving).forEach((itemId) => {
    formData.append("items_receiving[]", itemId);
  });

  // damages: indexados como damages[i][campo]
  (payload.damages ?? []).forEach((damage, i) => {
    formData.append(`damages[${i}][damage_type]`, damage.damage_type);
    if (damage.x_coordinate != null)
      formData.append(`damages[${i}][x_coordinate]`, String(damage.x_coordinate));
    if (damage.y_coordinate != null)
      formData.append(`damages[${i}][y_coordinate]`, String(damage.y_coordinate));
    if (damage.description)
      formData.append(`damages[${i}][description]`, damage.description);
    if (damage.photo_file instanceof File)
      formData.append(`damages[${i}][photo]`, damage.photo_file);
  });

  const { data } = await api.post<ReceptionChecklistResponse>(
    `${CHECKLIST_ENDPOINT}/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
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

export interface NextDocumentNumber {
  series: string;
  correlative: string;
  document_number: string;
}

export async function getNextShippingGuideDocumentNumber(
  documentSeriesId: number
): Promise<NextDocumentNumber> {
  const { data } = await api.get<NextDocumentNumber>(
    "/ap/commercial/shippingGuides/next-document-number",
    { params: { document_series_id: documentSeriesId } }
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
