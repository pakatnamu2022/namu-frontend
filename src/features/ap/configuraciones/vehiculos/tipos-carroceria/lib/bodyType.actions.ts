import { AxiosRequestConfig } from "axios";
import {
  BodyTypeResource,
  BodyTypeResponse,
  getBodyTypeProps,
} from "./bodyType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { BODY_TYPE } from "./bodyType.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

const { ENDPOINT } = BODY_TYPE;

export async function getBodyType({
  params,
}: getBodyTypeProps): Promise<BodyTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.BODY_TYPE,
    },
  };
  const { data } = await api.get<BodyTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBodyType({
  params,
}: getBodyTypeProps): Promise<BodyTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.BODY_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<BodyTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findBodyTypeById(id: number): Promise<BodyTypeResource> {
  const response = await api.get<BodyTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBodyType(data: any): Promise<BodyTypeResource> {
  const response = await api.post<BodyTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateBodyType(
  id: number,
  data: any
): Promise<BodyTypeResource> {
  const response = await api.put<BodyTypeResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBodyType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
