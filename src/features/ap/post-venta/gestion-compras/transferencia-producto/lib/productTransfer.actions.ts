import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PRODUCT_TRANSFER } from "./productTransfer.constants";
import {
  getProductTransferProps,
  ProductTransferRequest,
  ProductTransferResource,
  ProductTransferResponse,
} from "./productTransfer.interface";

const { ENDPOINT } = PRODUCT_TRANSFER;

export async function getProductTransfers({
  params,
}: getProductTransferProps): Promise<ProductTransferResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ProductTransferResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProductTransfers({
  params,
}: getProductTransferProps): Promise<ProductTransferResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<ProductTransferResource[]>(ENDPOINT, config);
  return data;
}

export async function getProductTransferById(
  id: number
): Promise<ProductTransferResource> {
  const { data } = await api.get<ProductTransferResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findProductTransferById(
  id: number
): Promise<ProductTransferResource> {
  const response = await api.get<ProductTransferResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProductTransfer(
  payload: ProductTransferRequest
): Promise<ProductTransferResource> {
  const { data } = await api.post<ProductTransferResource>(ENDPOINT, payload);
  return data;
}

export async function updateProductTransfer(
  id: number,
  payload: ProductTransferRequest
): Promise<ProductTransferResource> {
  const { data } = await api.put<ProductTransferResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteProductTransfer(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
