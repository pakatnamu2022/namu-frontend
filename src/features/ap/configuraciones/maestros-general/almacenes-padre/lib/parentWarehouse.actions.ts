import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";

import { STATUS_ACTIVE } from "@/core/core.constants";
import { PARENT_WAREHOUSE } from "./parentWarehouse.constants";
import {
  getParentWarehouseProps,
  ParentWarehouseResource,
  ParentWarehouseResponse,
} from "./parentWarehouse.interface";

const { ENDPOINT } = PARENT_WAREHOUSE;

export async function getParentWarehouse({
  params,
}: getParentWarehouseProps): Promise<ParentWarehouseResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ParentWarehouseResponse>(ENDPOINT, config);
  return data;
}

export async function getAllParentWarehouse({
  params,
}: getParentWarehouseProps): Promise<ParentWarehouseResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ParentWarehouseResource[]>(ENDPOINT, config);
  return data;
}

export async function findParentWarehouseById(
  id: number
): Promise<ParentWarehouseResource> {
  const response = await api.get<ParentWarehouseResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeParentWarehouse(
  data: any
): Promise<ParentWarehouseResource> {
  const response = await api.post<ParentWarehouseResource>(ENDPOINT, data);
  return response.data;
}

export async function updateParentWarehouse(
  id: number,
  data: any
): Promise<ParentWarehouseResource> {
  const response = await api.put<ParentWarehouseResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteParentWarehouse(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
