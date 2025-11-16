import { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import {
  getTaxClassTypesProps,
  TaxClassTypesResource,
  TaxClassTypesResponse,
} from "./taxClassTypes.interface";
import { TAX_CLASS_TYPES } from "./taxClassTypes.constants";

const { ENDPOINT } = TAX_CLASS_TYPES;

export async function getTaxClassTypes({
  params,
}: getTaxClassTypesProps): Promise<TaxClassTypesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<TaxClassTypesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTaxClassTypes({
  params,
}: getTaxClassTypesProps): Promise<TaxClassTypesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TaxClassTypesResource[]>(ENDPOINT, config);
  return data;
}

export async function findTaxClassTypesById(
  id: number
): Promise<TaxClassTypesResource> {
  const response = await api.get<TaxClassTypesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTaxClassTypes(
  data: any
): Promise<TaxClassTypesResource> {
  const response = await api.post<TaxClassTypesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTaxClassTypes(
  id: number,
  data: any
): Promise<TaxClassTypesResource> {
  const response = await api.put<TaxClassTypesResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTaxClassTypes(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
