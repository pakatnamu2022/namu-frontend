import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { TYPE_GENDER } from "./typesGender.constants";
import {
  getTypeGenderProps,
  TypeGenderResource,
  TypeGenderResponse,
} from "./typesGender.interface";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = TYPE_GENDER;

export async function getTypeGender({
  params,
}: getTypeGenderProps): Promise<TypeGenderResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.TYPE_GENDER,
    },
  };
  const { data } = await api.get<TypeGenderResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypeGender({
  params,
}: getTypeGenderProps): Promise<TypeGenderResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.TYPE_GENDER,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TypeGenderResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypeGenderById(
  id: number
): Promise<TypeGenderResource> {
  const response = await api.get<TypeGenderResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypeGender(data: any): Promise<TypeGenderResource> {
  const response = await api.post<TypeGenderResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypeGender(
  id: number,
  data: any
): Promise<TypeGenderResource> {
  const response = await api.put<TypeGenderResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteTypeGender(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
