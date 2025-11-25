import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { APPROVED_ACCESSORIES } from "./approvedAccessories.constants.ts";
import {
  ApprovedAccesoriesResource,
  ApprovedAccesoriesResponse,
  getApprovedAccesoriesProps,
} from "./approvedAccessories.interface.ts";

const { ENDPOINT } = APPROVED_ACCESSORIES;

export async function getApprovedAccesories({
  params,
}: getApprovedAccesoriesProps): Promise<ApprovedAccesoriesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ApprovedAccesoriesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllApprovedAccesories({
  params,
}: getApprovedAccesoriesProps): Promise<ApprovedAccesoriesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ApprovedAccesoriesResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findApprovedAccesoriesById(
  id: number
): Promise<ApprovedAccesoriesResource> {
  const response = await api.get<ApprovedAccesoriesResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeApprovedAccesories(
  data: any
): Promise<ApprovedAccesoriesResource> {
  const response = await api.post<ApprovedAccesoriesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateApprovedAccesories(
  id: number,
  data: any
): Promise<ApprovedAccesoriesResource> {
  const response = await api.put<ApprovedAccesoriesResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteApprovedAccesories(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
