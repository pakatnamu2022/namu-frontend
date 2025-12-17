import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PER_DIEM_REQUEST } from "./perDiemRequest.constants";
import {
  getPerDiemRequestProps,
  PerDiemRequestRequest,
  PerDiemRequestResource,
  PerDiemRequestResponse,
} from "./perDiemRequest.interface";

const { ENDPOINT } = PER_DIEM_REQUEST;

export async function getPerDiemRequest({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemRequestResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPerDiemRequest({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<PerDiemRequestResource[]>(ENDPOINT, config);
  return data;
}

export async function findPerDiemRequestById(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.get<PerDiemRequestResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePerDiemRequest(
  data: PerDiemRequestRequest
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePerDiemRequest(
  id: number,
  data: any
): Promise<PerDiemRequestResource> {
  const response = await api.put<PerDiemRequestResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePerDiemRequest(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
