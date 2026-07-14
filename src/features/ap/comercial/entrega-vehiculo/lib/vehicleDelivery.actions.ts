import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  AvailableDeliverySlotsResponse,
  getVehiclesDeliveryProps,
  VehiclesDeliveryResource,
  VehiclesDeliveryResponse,
} from "./vehicleDelivery.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { VEHICLE_DELIVERY } from "./vehicleDelivery.constants";
import {
  QueryFromNubefactResponse,
  SendToNubefactResponse,
} from "../../envios-recepciones/lib/shipmentsReceptions.interface";

const { ENDPOINT } = VEHICLE_DELIVERY;

export async function getVehiclesDelivery({
  params,
}: getVehiclesDeliveryProps): Promise<VehiclesDeliveryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<VehiclesDeliveryResponse>(ENDPOINT, config);
  return data;
}

export async function findVehicleDeliveryById(
  id: number
): Promise<VehiclesDeliveryResource> {
  const response = await api.get<VehiclesDeliveryResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicleDelivery(
  data: any
): Promise<VehiclesDeliveryResource> {
  const response = await api.post<VehiclesDeliveryResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicleDelivery(
  id: number,
  data: any
): Promise<VehiclesDeliveryResource> {
  const response = await api.put<VehiclesDeliveryResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVehicleDelivery(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function sendVehicleDeliveryToNubefact(
  id: number
): Promise<SendToNubefactResponse> {
  const { data } = await api.post<SendToNubefactResponse>(
    `${ENDPOINT}/${id}/send-to-nubefact`
  );
  return data;
}

// Función para consultar el estado en Nubefact
export async function queryVehicleDeliveryFromNubefact(
  id: number
): Promise<QueryFromNubefactResponse> {
  const { data } = await api.post<QueryFromNubefactResponse>(
    `${ENDPOINT}/${id}/query-from-nubefact`
  );
  return data;
}

export async function generateOrUpdateShippingGuide(
  id: number,
  shippingData: any
): Promise<VehiclesDeliveryResource> {
  const { data } = await api.post<VehiclesDeliveryResource>(
    `${ENDPOINT}/${id}/generate-shipping-guide`,
    shippingData
  );
  return data;
}

export interface NextShippingGuideDocumentNumber {
  series: string;
  correlative: string;
  document_number: string;
}

export async function getNextShippingGuideDocumentNumber(
  documentSeriesId: number
): Promise<NextShippingGuideDocumentNumber> {
  const { data } = await api.get<NextShippingGuideDocumentNumber>(
    "/ap/commercial/shippingGuides/next-document-number",
    { params: { document_series_id: documentSeriesId } }
  );
  return data;
}

export async function dispatchAllShippingGuides(): Promise<void> {
  await api.post("/ap/commercial/shippingGuides/dispatch-all");
}

export async function dispatchShippingGuideMigration(id: number): Promise<void> {
  await api.post(`/ap/commercial/shippingGuides/${id}/dispatch-migration`);
}

export async function syncAccountingEntry(id: number): Promise<void> {
  await api.post(`${ENDPOINT}/${id}/sync-accounting-entry`);
}

export async function rescheduleVehicleDelivery(
  id: number,
  data: { scheduled_delivery_date: string; observations?: string }
): Promise<VehiclesDeliveryResource> {
  const response = await api.post<VehiclesDeliveryResource>(
    `${ENDPOINT}/${id}/reschedule`,
    data
  );
  return response.data;
}

export async function exportVehicleDelivery(
  format: "excel" | "pdf",
  params?: Record<string, any>
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/export`, {
    params: { ...params, format },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `entregas-vehiculos.${format === "excel" ? "xlsx" : "pdf"}`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getAvailableDeliverySlots(
  date: string,
  shopId?: number
): Promise<AvailableDeliverySlotsResponse> {
  const { data } = await api.get<AvailableDeliverySlotsResponse>(
    `${ENDPOINT}/available-slots`,
    { params: { date, shop_id: shopId } }
  );
  return data;
}
