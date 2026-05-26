import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  SendToNubefactResponse,
  QueryFromNubefactResponse,
} from "../../comercial/envios-recepciones/lib/shipmentsReceptions.interface";
import {
  getShippingGuidesProps,
  ShippingGuidesResponse,
  ShippingGuidesResource,
  ShippingGuidesRequest,
} from "./shippingGuides.interface";
import { SHIPPING_GUIDES } from "./shippingGuides.constants";
import { ControlUnitsRequest } from "../../comercial/control-unidades/lib/controlUnits.interface";

const { ENDPOINT } = SHIPPING_GUIDES;

export async function getShippingGuides({
  params,
}: getShippingGuidesProps): Promise<ShippingGuidesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ShippingGuidesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllShippingGuides({
  params,
}: getShippingGuidesProps): Promise<ShippingGuidesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<ShippingGuidesResource[]>(ENDPOINT, config);
  return data;
}

export async function getShippingGuidesById(
  id: number,
): Promise<ShippingGuidesResource> {
  const { data } = await api.get<ShippingGuidesResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findShippingGuidesById(
  id: number,
): Promise<ShippingGuidesResource> {
  const response = await api.get<ShippingGuidesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeShippingGuides(
  payload: ShippingGuidesRequest,
): Promise<ShippingGuidesResource> {
  const { data } = await api.post<ShippingGuidesResource>(ENDPOINT, payload);
  return data;
}

export async function updateShippingGuides(
  id: number,
  payload: ShippingGuidesRequest,
): Promise<ShippingGuidesResource> {
  const { data } = await api.post<ShippingGuidesResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteShippingGuides(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

// Función para enviar a Nubefact
export async function sendShippingGuideToNubefact(
  id: number,
): Promise<SendToNubefactResponse> {
  const { data } = await api.post<SendToNubefactResponse>(
    `${ENDPOINT}/${id}/send-to-nubefact`,
  );
  return data;
}

// Función para consultar el estado en Nubefact
export async function queryShippingGuideFromNubefact(
  id: number,
): Promise<QueryFromNubefactResponse> {
  const { data } = await api.post<QueryFromNubefactResponse>(
    `${ENDPOINT}/${id}/query-from-nubefact`,
  );
  return data;
}

// Función para obtener logs de la guía
export async function getShippingGuideLogs(id: number): Promise<any> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}/logs`);
  return data;
}

// Función para obtener historial de la guía
export async function getShippingGuideHistory(id: number): Promise<any> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}/history`);
  return data;
}

// Función para marcar como recibido (solo para traslado entre almacenes)
export async function markAsReceived(
  id: number,
  note_received?: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `${ENDPOINT}/${id}/mark-as-received`,
    { note_received },
  );
  return data;
}

export interface NextDocumentNumber {
  series: string;
  correlative: string;
  document_number: string;
}

export async function getNextShippingGuideDocumentNumber(
  documentSeriesId: number,
): Promise<NextDocumentNumber> {
  const { data } = await api.get<NextDocumentNumber>(
    `${ENDPOINT}/next-document-number`,
    { params: { document_series_id: documentSeriesId } },
  );
  return data;
}

// Función para cancelar guía de remisión
export async function cancelShippingGuide(
  id: number,
  cancellation_reason: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `${ENDPOINT}/${id}/cancel`,
    { cancellation_reason },
  );
  return data;
}

// Función para sincronizar guía de remisión con Dynamics
export async function syncShippingGuideWithDynamics(
  id: number,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `${ENDPOINT}/${id}/sync-with-dynamics`,
  );
  return data;
}

// Función para crear guía de consignación
export async function storeConsignment(
  payload: ControlUnitsRequest,
): Promise<ShippingGuidesResource> {
  const { data } = await api.post<ShippingGuidesResource>(
    `${ENDPOINT}/consignment`,
    payload,
  );
  return data;
}

export async function dispatchShippingGuideMigration(
  id: number,
): Promise<void> {
  await api.post(`${ENDPOINT}/${id}/dispatch-migration`);
}

export async function dispatchAllShippingGuides(): Promise<void> {
  await api.post(`${ENDPOINT}/dispatch-all`);
}
