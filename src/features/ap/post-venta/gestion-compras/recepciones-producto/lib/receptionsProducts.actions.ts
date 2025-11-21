import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getReceptionsProps,
  ReceptionRequest,
  ReceptionResource,
  ReceptionResponse,
} from "./receptionsProducts.interface";
import { RECEPTION } from "./receptionsProducts.constants";

const { ENDPOINT } = RECEPTION;

export async function getReceptions({
  params,
  purchaseOrderId,
}: getReceptionsProps): Promise<ReceptionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      ...(purchaseOrderId && { purchase_order_id: purchaseOrderId }),
    },
  };
  const { data } = await api.get<ReceptionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllReceptions({
  params,
  purchaseOrderId,
}: getReceptionsProps): Promise<ReceptionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      ...(purchaseOrderId && { purchase_order_id: purchaseOrderId }),
      all: true,
    },
  };
  const { data } = await api.get<ReceptionResource[]>(ENDPOINT, config);
  return data;
}

export async function getReceptionById(id: number): Promise<ReceptionResource> {
  const { data } = await api.get<ReceptionResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findReceptionById(
  id: number
): Promise<ReceptionResource> {
  const response = await api.get<ReceptionResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeReception(
  payload: ReceptionRequest
): Promise<ReceptionResource> {
  const { data } = await api.post<ReceptionResource>(ENDPOINT, payload);
  return data;
}

export async function updateReception(
  id: number,
  payload: Partial<ReceptionRequest>
): Promise<ReceptionResource> {
  const { data } = await api.put<ReceptionResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteReception(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
