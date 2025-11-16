import { api } from "@/core/api";
import { AxiosRequestConfig } from "axios";
import {
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

// Función para enviar a Dynamic
export async function sendVehicleDeliveryToDynamic(
  id: number
): Promise<SendToNubefactResponse> {
  const { data } = await api.post<SendToNubefactResponse>(
    `${ENDPOINT}/${id}/send-to-dynamic`
  );
  return data;
}
