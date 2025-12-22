import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { PER_DIEM_RATE } from "./perDiemRate.constants";
import {
  getPerDiemRateProps,
  PerDiemRateResource,
  PerDiemRateResponse,
} from "./perDiemRate.interface";

const { ENDPOINT } = PER_DIEM_RATE;

export async function getPerDiemRate({
  params,
}: getPerDiemRateProps): Promise<PerDiemRateResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PerDiemRateResponse>(ENDPOINT, config);
  return data;
}

export async function getPerDiemRateSearch({
  params,
}: getPerDiemRateProps): Promise<PerDiemRateResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PerDiemRateResponse>(ENDPOINT, config);
  return data.data;
}

export async function getAllPerDiemRate({
  params,
}: getPerDiemRateProps): Promise<PerDiemRateResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      active: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<PerDiemRateResource[]>(ENDPOINT, config);
  return data;
}

export async function findPerDiemRateById(
  id: number
): Promise<PerDiemRateResource> {
  const response = await api.get<PerDiemRateResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePerDiemRate(
  data: any
): Promise<PerDiemRateResource> {
  const response = await api.post<PerDiemRateResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePerDiemRate(
  id: number,
  data: any
): Promise<PerDiemRateResource> {
  const response = await api.put<PerDiemRateResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePerDiemRate(
  id: number
): Promise<PerDiemRateResponse> {
  const { data } = await api.delete<PerDiemRateResponse>(`${ENDPOINT}/${id}`);
  return data;
}
