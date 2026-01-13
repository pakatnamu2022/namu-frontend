import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { SUPPLIER_ORDER } from "./supplierOrder.constants";
import {
  getSupplierOrderProps,
  SupplierOrderRequest,
  SupplierOrderResource,
  SupplierOrderResponse,
} from "./supplierOrder.interface";

const { ENDPOINT } = SUPPLIER_ORDER;

export async function getSupplierOrder({
  params,
}: getSupplierOrderProps): Promise<SupplierOrderResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<SupplierOrderResponse>(ENDPOINT, config);
  return data;
}

export async function getAllSupplierOrder({
  params,
}: getSupplierOrderProps): Promise<SupplierOrderResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<SupplierOrderResource[]>(ENDPOINT, config);
  return data;
}

export async function getSupplierOrderById(
  id: number
): Promise<SupplierOrderResource> {
  const { data } = await api.get<SupplierOrderResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findSupplierOrderById(
  id: number
): Promise<SupplierOrderResource> {
  const response = await api.get<SupplierOrderResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeSupplierOrder(
  payload: SupplierOrderRequest
): Promise<SupplierOrderResource> {
  const { data } = await api.post<SupplierOrderResource>(ENDPOINT, payload);
  return data;
}

export async function updateSupplierOrder(
  id: number,
  payload: Partial<SupplierOrderRequest>
): Promise<SupplierOrderResource> {
  const { data } = await api.put<SupplierOrderResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteSupplierOrder(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
