import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ECONOMIC_ACTIVITY } from "./economicActivity.constants";
import {
  EconomicActivityResource,
  EconomicActivityResponse,
  getEconomicActivityProps,
} from "./economicActivity.interface";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

const { ENDPOINT } = ECONOMIC_ACTIVITY;

export async function getEconomicActivity({
  params,
}: getEconomicActivityProps): Promise<EconomicActivityResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.ECONOMIC_ACTIVITY,
    },
  };
  const { data } = await api.get<EconomicActivityResponse>(ENDPOINT, config);
  return data;
}

export async function getAllEconomicActivity({
  params,
}: getEconomicActivityProps): Promise<EconomicActivityResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.ECONOMIC_ACTIVITY,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<EconomicActivityResource[]>(ENDPOINT, config);
  return data;
}

export async function findEconomicActivityById(
  id: number
): Promise<EconomicActivityResource> {
  const response = await api.get<EconomicActivityResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeEconomicActivity(
  data: any
): Promise<EconomicActivityResource> {
  const response = await api.post<EconomicActivityResource>(ENDPOINT, data);
  return response.data;
}

export async function updateEconomicActivity(
  id: number,
  data: any
): Promise<EconomicActivityResource> {
  const response = await api.put<EconomicActivityResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteEconomicActivity(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
