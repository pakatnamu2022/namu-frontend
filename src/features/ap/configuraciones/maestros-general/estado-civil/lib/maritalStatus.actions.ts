import { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { MARITAL_STATUS } from "./maritalStatus.constants";
import {
  getMaritalStatusProps,
  MaritalStatusResource,
  MaritalStatusResponse,
} from "./maritalStatus.interface";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = MARITAL_STATUS;

export async function getMaritalStatus({
  params,
}: getMaritalStatusProps): Promise<MaritalStatusResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.MARITAL_STATUS,
    },
  };
  const { data } = await api.get<MaritalStatusResponse>(ENDPOINT, config);
  return data;
}

export async function getAllMaritalStatus({
  params,
}: getMaritalStatusProps): Promise<MaritalStatusResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.MARITAL_STATUS,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<MaritalStatusResource[]>(ENDPOINT, config);
  return data;
}

export async function findMaritalStatusById(
  id: number
): Promise<MaritalStatusResource> {
  const response = await api.get<MaritalStatusResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeMaritalStatus(
  data: any
): Promise<MaritalStatusResource> {
  const response = await api.post<MaritalStatusResource>(ENDPOINT, data);
  return response.data;
}

export async function updateMaritalStatus(
  id: number,
  data: any
): Promise<MaritalStatusResource> {
  const response = await api.put<MaritalStatusResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteMaritalStatus(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
