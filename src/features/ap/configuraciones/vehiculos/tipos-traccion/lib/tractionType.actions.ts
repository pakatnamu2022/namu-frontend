import type { AxiosRequestConfig } from "axios";
import {
  getTractionTypeProps,
  TractionTypeResource,
  TractionTypeResponse,
} from "./tractionType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { TRACTION_TYPE } from "./tractionType.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

const { ENDPOINT } = TRACTION_TYPE;

export async function getTractionType({
  params,
}: getTractionTypeProps): Promise<TractionTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.TRACTION_TYPE,
    },
  };
  const { data } = await api.get<TractionTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTractionType({
  params,
}: getTractionTypeProps): Promise<TractionTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.TRACTION_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TractionTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findTractionTypeById(
  id: number
): Promise<TractionTypeResource> {
  const response = await api.get<TractionTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTractionType(
  data: any
): Promise<TractionTypeResource> {
  const response = await api.post<TractionTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTractionType(
  id: number,
  data: any
): Promise<TractionTypeResource> {
  const response = await api.put<TractionTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTractionType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
