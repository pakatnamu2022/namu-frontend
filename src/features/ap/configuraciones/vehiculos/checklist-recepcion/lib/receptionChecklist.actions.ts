import { AxiosRequestConfig } from "axios";
import {
  getReceptionChecklistProps,
  ReceptionChecklistResource,
  ReceptionChecklistResponse,
} from "./receptionChecklist.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AP_CHECKLIST } from "@/core/core.constants";
import { ITEM_RECEPTION } from "./receptionChecklist.constants";

const { ENDPOINT } = ITEM_RECEPTION;

export async function getReceptionChecklist({
  params,
}: getReceptionChecklistProps): Promise<ReceptionChecklistResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_CHECKLIST.RECEPCION,
    },
  };
  const { data } = await api.get<ReceptionChecklistResponse>(ENDPOINT, config);
  return data;
}

export async function getAllReceptionChecklist({
  params,
}: getReceptionChecklistProps): Promise<ReceptionChecklistResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      tipo: AP_CHECKLIST.RECEPCION,
    },
  };
  const { data } = await api.get<ReceptionChecklistResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findReceptionChecklistById(
  id: number
): Promise<ReceptionChecklistResource> {
  const response = await api.get<ReceptionChecklistResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeReceptionChecklist(
  data: any
): Promise<ReceptionChecklistResource> {
  const response = await api.post<ReceptionChecklistResource>(ENDPOINT, data);
  return response.data;
}

export async function updateReceptionChecklist(
  id: number,
  data: any
): Promise<ReceptionChecklistResource> {
  const response = await api.put<ReceptionChecklistResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteReceptionChecklist(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
