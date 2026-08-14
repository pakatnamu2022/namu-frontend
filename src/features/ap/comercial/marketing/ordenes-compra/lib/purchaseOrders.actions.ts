import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { MARKETING_PURCHASE_ORDERS } from "./purchaseOrders.constants";
import {
  PurchaseOrdersResource,
  PurchaseOrdersResponse,
  getPurchaseOrdersProps,
} from "./purchaseOrders.interface";
import { PurchaseOrdersSchema } from "./purchaseOrders.schema";

const { ENDPOINT } = MARKETING_PURCHASE_ORDERS;

export async function getPurchaseOrders({
  params,
}: getPurchaseOrdersProps): Promise<PurchaseOrdersResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<PurchaseOrdersResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPurchaseOrders({
  params,
}: getPurchaseOrdersProps = {}): Promise<PurchaseOrdersResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<PurchaseOrdersResource[]>(ENDPOINT, config);
  return data;
}

export async function findPurchaseOrdersById(
  id: number,
): Promise<PurchaseOrdersResource> {
  const { data } = await api.get<PurchaseOrdersResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storePurchaseOrders(
  payload: PurchaseOrdersSchema,
): Promise<PurchaseOrdersResource> {
  const { data } = await api.post<PurchaseOrdersResource>(ENDPOINT, payload);
  return data;
}

export async function updatePurchaseOrders(
  id: number,
  payload: Partial<PurchaseOrdersSchema>,
): Promise<PurchaseOrdersResource> {
  const { data } = await api.put<PurchaseOrdersResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deletePurchaseOrders(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function changePurchaseOrderStatus(
  id: number,
  status: string,
  electronic_document_id?: number,
): Promise<PurchaseOrdersResource> {
  const payload: Record<string, any> = { status };
  if (electronic_document_id) payload.electronic_document_id = electronic_document_id;
  const { data } = await api.patch<PurchaseOrdersResource>(
    `${ENDPOINT}/${id}/status`,
    payload,
  );
  return data;
}
