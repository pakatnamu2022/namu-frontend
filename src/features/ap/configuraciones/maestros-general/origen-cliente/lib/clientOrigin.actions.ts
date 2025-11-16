import { AxiosRequestConfig } from "axios";
import { CLIENT_ORIGIN } from "./clientOrigin.constants";
import {
  ClientOriginResource,
  ClientOriginResponse,
  getClientOriginProps,
} from "./clientOrigin.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = CLIENT_ORIGIN;

export async function getClientOrigin({
  params,
}: getClientOriginProps): Promise<ClientOriginResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.CLIENT_ORIGIN,
    },
  };
  const { data } = await api.get<ClientOriginResponse>(ENDPOINT, config);
  return data;
}

export async function getAllClientOrigin({
  params,
}: getClientOriginProps): Promise<ClientOriginResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.CLIENT_ORIGIN,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ClientOriginResource[]>(ENDPOINT, config);
  return data;
}

export async function findClientOriginById(
  id: number
): Promise<ClientOriginResource> {
  const response = await api.get<ClientOriginResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeClientOrigin(
  data: any
): Promise<ClientOriginResource> {
  const response = await api.post<ClientOriginResource>(ENDPOINT, data);
  return response.data;
}

export async function updateClientOrigin(
  id: number,
  data: any
): Promise<ClientOriginResource> {
  const response = await api.put<ClientOriginResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteClientOrigin(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
