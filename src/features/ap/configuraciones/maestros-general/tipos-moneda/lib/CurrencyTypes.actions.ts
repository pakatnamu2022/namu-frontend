import type { AxiosRequestConfig } from "axios";
import {
  CurrencyTypesResource,
  CurrencyTypesResponse,
  getCurrencyTypesProps,
} from "./CurrencyTypes.interface";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { CURRENCY_TYPES } from "./CurrencyTypes.constants";

const { ENDPOINT } = CURRENCY_TYPES;

export async function getCurrencyTypes({
  params,
}: getCurrencyTypesProps): Promise<CurrencyTypesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CurrencyTypesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCurrencyTypes({
  params,
}: getCurrencyTypesProps): Promise<CurrencyTypesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<CurrencyTypesResource[]>(ENDPOINT, config);
  return data;
}

export async function findCurrencyTypesById(
  id: number
): Promise<CurrencyTypesResource> {
  const response = await api.get<CurrencyTypesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeCurrencyTypes(
  data: any
): Promise<CurrencyTypesResource> {
  const response = await api.post<CurrencyTypesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateCurrencyTypes(
  id: number,
  data: any
): Promise<CurrencyTypesResource> {
  const response = await api.put<CurrencyTypesResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteCurrencyTypes(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
