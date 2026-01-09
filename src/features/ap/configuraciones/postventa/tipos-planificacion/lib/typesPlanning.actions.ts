import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { TYPE_PLANNING } from "./typesPlanning.constants.ts";
import {
  getTypesPlanningProps,
  TypesPlanningResource,
  TypesPlanningResponse,
} from "./typesPlanning.interface.ts";

const { ENDPOINT } = TYPE_PLANNING;

export async function getTypesPlanning({
  params,
}: getTypesPlanningProps): Promise<TypesPlanningResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: [AP_MASTER_TYPE.TYPE_PLANNING],
    },
  };
  const { data } = await api.get<TypesPlanningResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypesPlanning({
  params,
}: getTypesPlanningProps): Promise<TypesPlanningResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: [AP_MASTER_TYPE.TYPE_PLANNING],
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TypesPlanningResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypesPlanningById(
  id: number
): Promise<TypesPlanningResource> {
  const response = await api.get<TypesPlanningResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypesPlanning(
  data: any
): Promise<TypesPlanningResource> {
  const response = await api.post<TypesPlanningResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypesPlanning(
  id: number,
  data: any
): Promise<TypesPlanningResource> {
  const response = await api.put<TypesPlanningResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTypesPlanning(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
