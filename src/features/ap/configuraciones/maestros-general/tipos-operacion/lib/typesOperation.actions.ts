import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { TYPES_OPERATION } from "./typesOperation.constants";
import {
  getTypesOperationProps,
  TypesOperationResource,
  TypesOperationResponse,
} from "./typesOperation.interface";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = TYPES_OPERATION;

export async function getTypesOperation({
  params,
}: getTypesOperationProps): Promise<TypesOperationResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.TYPE_OPERATION,
    },
  };
  const { data } = await api.get<TypesOperationResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypesOperation({
  params,
}: getTypesOperationProps): Promise<TypesOperationResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.TYPE_OPERATION,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TypesOperationResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypesOperationById(
  id: number
): Promise<TypesOperationResource> {
  const response = await api.get<TypesOperationResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypesOperation(
  data: any
): Promise<TypesOperationResource> {
  const response = await api.post<TypesOperationResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypesOperation(
  id: number,
  data: any
): Promise<TypesOperationResource> {
  const response = await api.put<TypesOperationResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTypesOperation(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
