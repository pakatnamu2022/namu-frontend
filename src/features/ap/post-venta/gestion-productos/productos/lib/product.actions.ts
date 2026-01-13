import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PRODUCT } from "./product.constants";
import {
  getProductProps,
  ProductResource,
  ProductResponse,
} from "./product.interface";

const { ENDPOINT } = PRODUCT;

export async function getProduct({
  params,
}: getProductProps): Promise<ProductResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ProductResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProduct({
  params,
}: getProductProps): Promise<ProductResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: "ACTIVE",
    },
  };
  const { data } = await api.get<ProductResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductById(id: number): Promise<ProductResource> {
  const response = await api.get<ProductResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProduct(data: any): Promise<ProductResource> {
  const response = await api.post<ProductResource>(ENDPOINT, data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: any
): Promise<ProductResource> {
  const response = await api.put<ProductResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function assignToWarehouse(
  product_id: number,
  warehouse_id: number
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/assign-to-warehouse`,
    {
      product_id,
      warehouse_id,
    }
  );
  return data;
}
