import { api } from "@/core/api";
import { ITEM_DELIVERY } from "./deliveryChecklist.constants";
import {
  DeliveryChecklistResource,
  DeliveryChecklistResponse,
  getDeliveryChecklistProps,
} from "./deliveryChecklist.interface";
import type { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AP_CHECKLIST } from "@/core/core.constants";

const { ENDPOINT } = ITEM_DELIVERY;

export async function getDeliveryChecklist({
  params,
}: getDeliveryChecklistProps): Promise<DeliveryChecklistResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_CHECKLIST.ENTREGA,
    },
  };
  const { data } = await api.get<DeliveryChecklistResponse>(ENDPOINT, config);
  return data;
}

export async function getAllDeliveryChecklist({
  params,
}: getDeliveryChecklistProps): Promise<DeliveryChecklistResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      tipo: AP_CHECKLIST.ENTREGA,
    },
  };
  const { data } = await api.get<DeliveryChecklistResource[]>(ENDPOINT, config);
  return data;
}

export async function findDeliveryChecklistById(
  id: number
): Promise<DeliveryChecklistResource> {
  const response = await api.get<DeliveryChecklistResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeDeliveryChecklist(
  data: any
): Promise<DeliveryChecklistResource> {
  const response = await api.post<DeliveryChecklistResource>(ENDPOINT, data);
  return response.data;
}

export async function updateDeliveryChecklist(
  id: number,
  data: any
): Promise<DeliveryChecklistResource> {
  const response = await api.put<DeliveryChecklistResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteDeliveryChecklist(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
