import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";

import { STATUS_ACTIVE } from "@/core/core.constants";
import { WAREHOUSE } from "./warehouse.constants";
import {
  getWarehouseProps,
  WarehouseResource,
  WarehouseResponse,
} from "./warehouse.interface";

const { ENDPOINT } = WAREHOUSE;

export async function getWarehouse({
  params,
}: getWarehouseProps): Promise<WarehouseResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WarehouseResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWarehouse({
  params,
}: getWarehouseProps): Promise<WarehouseResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<WarehouseResource[]>(ENDPOINT, config);
  return data;
}

export async function getWarehouseByModelSede({
  params,
}: getWarehouseProps): Promise<WarehouseResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WarehouseResource[]>(
    `${ENDPOINT}/by-model-sede`,
    config
  );
  return data;
}

export async function getWarehousesByCompany({
  params,
}: getWarehouseProps): Promise<WarehouseResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WarehouseResource[]>(
    `${ENDPOINT}/warehouses-by-company`,
    config
  );
  return data;
}

export async function findWarehouseById(
  id: number
): Promise<WarehouseResource> {
  const response = await api.get<WarehouseResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWarehouse(data: any): Promise<WarehouseResource> {
  const response = await api.post<WarehouseResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWarehouse(
  id: number,
  data: any
): Promise<WarehouseResource> {
  const response = await api.put<WarehouseResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWarehouse(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
