import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getPurchaseOrderProductsProps,
  PurchaseOrderProductsRequest,
  PurchaseOrderProductsResource,
  PurchaseOrderProductsResponse,
} from "./purchaseOrderProducts.interface";
import { PURCHASE_ORDER_PRODUCT } from "./purchaseOrderProducts.constants";

const { ENDPOINT } = PURCHASE_ORDER_PRODUCT;

export async function getPurchaseOrderProducts({
  params,
}: getPurchaseOrderProductsProps): Promise<PurchaseOrderProductsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PurchaseOrderProductsResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllPurchaseOrderProducts({
  params,
}: getPurchaseOrderProductsProps): Promise<PurchaseOrderProductsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<PurchaseOrderProductsResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getPurchaseOrderProductsById(
  id: number
): Promise<PurchaseOrderProductsResource> {
  const { data } = await api.get<PurchaseOrderProductsResource>(
    `${ENDPOINT}/${id}`
  );
  return data;
}

export async function findPurchaseOrderProductsById(
  id: number
): Promise<PurchaseOrderProductsResource> {
  const response = await api.get<PurchaseOrderProductsResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storePurchaseOrderProducts(
  payload: PurchaseOrderProductsRequest
): Promise<PurchaseOrderProductsResource> {
  const { data } = await api.post<PurchaseOrderProductsResource>(
    ENDPOINT,
    payload
  );
  return data;
}

export async function updatePurchaseOrderProducts(
  id: number,
  payload: Partial<PurchaseOrderProductsRequest>
): Promise<PurchaseOrderProductsResource> {
  const { data } = await api.put<PurchaseOrderProductsResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deletePurchaseOrderProducts(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function approvePurchaseOrderProducts(
  id: number
): Promise<PurchaseOrderProductsResource> {
  const { data } = await api.post<PurchaseOrderProductsResource>(
    `${ENDPOINT}/${id}/approve`
  );
  return data;
}

export async function receivePurchaseOrderProducts(
  id: number,
  payload?: { actual_delivery_date?: string; notes?: string }
): Promise<PurchaseOrderProductsResource> {
  const { data } = await api.post<PurchaseOrderProductsResource>(
    `${ENDPOINT}/${id}/receive`,
    payload
  );
  return data;
}

export async function cancelPurchaseOrderProducts(
  id: number,
  payload?: { notes?: string }
): Promise<PurchaseOrderProductsResource> {
  const { data } = await api.post<PurchaseOrderProductsResource>(
    `${ENDPOINT}/${id}/cancel`,
    payload
  );
  return data;
}
