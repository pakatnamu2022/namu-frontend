import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { TYPES_CATEGORY } from "./typesCategory.constants";
import {
  getTypesCategoryProps,
  TypesCategoryResource,
  TypesCategoryResponse,
} from "./typesCategory.interface";
import { AP_MASTER_POST_VENTA } from "@/features/ap/lib/ap.constants";

const { ENDPOINT } = TYPES_CATEGORY;

export async function getTypesCategory({
  params,
}: getTypesCategoryProps): Promise<TypesCategoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: [AP_MASTER_POST_VENTA.TYPE_CATEGORY],
    },
  };
  const { data } = await api.get<TypesCategoryResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypesCategory({
  params,
}: getTypesCategoryProps): Promise<TypesCategoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: [AP_MASTER_POST_VENTA.TYPE_CATEGORY],
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TypesCategoryResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypesCategoryById(
  id: number
): Promise<TypesCategoryResource> {
  const response = await api.get<TypesCategoryResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypesCategory(
  data: any
): Promise<TypesCategoryResource> {
  const response = await api.post<TypesCategoryResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypesCategory(
  id: number,
  data: any
): Promise<TypesCategoryResource> {
  const response = await api.put<TypesCategoryResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTypesCategory(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
