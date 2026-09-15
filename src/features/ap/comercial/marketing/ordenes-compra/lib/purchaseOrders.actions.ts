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
  payload: PurchaseOrdersSchema & { file?: File | null },
): Promise<PurchaseOrdersResource> {
  const { file, ...rest } = payload;

  if (file) {
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    formData.append("file", file);
    const { data } = await api.post<PurchaseOrdersResource>(ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await api.post<PurchaseOrdersResource>(ENDPOINT, rest);
  return data;
}

export async function updatePurchaseOrders(
  id: number,
  payload: Partial<PurchaseOrdersSchema> & { file?: File | null },
): Promise<PurchaseOrdersResource> {
  const { file, ...rest } = payload;

  if (file) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    formData.append("file", file);
    const { data } = await api.post<PurchaseOrdersResource>(`${ENDPOINT}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await api.put<PurchaseOrdersResource>(
    `${ENDPOINT}/${id}`,
    rest,
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
