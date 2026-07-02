import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { PRODUCT } from "./product.constants.ts";
import {
  getProductProps,
  ProductResource,
  ProductResponse,
} from "./product.interface.ts";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";

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
  data: any,
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
  warehouse_id: number,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/assign-to-warehouse`,
    {
      product_id,
      warehouse_id,
    },
  );
  return data;
}

export async function getWarehousesByProduct(
  id: number,
): Promise<WarehouseResource[]> {
  const config: AxiosRequestConfig = {};
  const { data } = await api.get<WarehouseResource[]>(
    `${ENDPOINT}/${id}/warehouses-availability`,
    config,
  );
  return data;
}

export async function exportProduct({
  params,
}: getProductProps): Promise<void> {
  const config: AxiosRequestConfig = {
    params,
    responseType: "blob",
  };

  const response = await api.get(`${ENDPOINT}/export/excel`, config);

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `productos-repuestos-${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
