import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { TYPE_PERSON } from "./typeClient.constants";
import {
  getTypeClientProps,
  TypeClientResource,
  TypeClientResponse,
} from "./typeClient.interface";
import { AP_MASTER_TYPE } from "../../../../ap-master/lib/apMaster.constants";

const { ENDPOINT } = TYPE_PERSON;

export async function getTypeClient({
  params,
}: getTypeClientProps): Promise<TypeClientResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.TYPE_PERSON,
    },
  };
  const { data } = await api.get<TypeClientResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypeClient({
  params,
}: getTypeClientProps): Promise<TypeClientResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.TYPE_PERSON,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TypeClientResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypeClientById(
  id: number
): Promise<TypeClientResource> {
  const response = await api.get<TypeClientResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypeClient(data: any): Promise<TypeClientResource> {
  const response = await api.post<TypeClientResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypeClient(
  id: number,
  data: any
): Promise<TypeClientResource> {
  const response = await api.put<TypeClientResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteTypeClient(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
