import { api } from "@/src/core/api";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { REASONS_REJECTION } from "./reasonsRejection.constants";
import {
  getReasonsRejectionProps,
  ReasonsRejectionResource,
  ReasonsRejectionResponse,
} from "./reasonsRejection.interface";
import { AP_MASTER_COMERCIAL } from "../../../lib/ap.constants";

const { ENDPOINT } = REASONS_REJECTION;

export async function getAllReasonsRejection({
  params,
}: getReasonsRejectionProps): Promise<ReasonsRejectionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.REASONS_REJECTION,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ReasonsRejectionResource[]>(ENDPOINT, config);
  return data;
}

export async function getReasonsRejection({
  params,
}: getReasonsRejectionProps): Promise<ReasonsRejectionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.REASONS_REJECTION,
    },
  };
  const { data } = await api.get<ReasonsRejectionResponse>(ENDPOINT, config);
  return data;
}

export async function findReasonsRejectionById(
  id: number
): Promise<ReasonsRejectionResource> {
  const response = await api.get<ReasonsRejectionResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeReasonsRejection(
  data: any
): Promise<ReasonsRejectionResource> {
  const response = await api.post<ReasonsRejectionResource>(ENDPOINT, data);
  return response.data;
}

export async function updateReasonsRejection(
  id: number,
  data: any
): Promise<ReasonsRejectionResource> {
  const response = await api.put<ReasonsRejectionResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteReasonsRejection(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
