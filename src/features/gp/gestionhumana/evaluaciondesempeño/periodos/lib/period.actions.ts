import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";
import {
  getPeriodsProps,
  PeriodResource,
  PeriodResponse,
} from "./period.interface";
import { PERIOD } from "./period.constans";

const { ENDPOINT } = PERIOD;

export async function getPeriod({
  params,
}: getPeriodsProps): Promise<PeriodResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PeriodResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPeriods(): Promise<PeriodResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
    },
  };
  const { data } = await api.get<PeriodResource[]>(ENDPOINT, config);
  return data;
}

export async function findPeriodById(id: string): Promise<PeriodResource> {
  const response = await api.get<PeriodResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePeriod(data: any): Promise<PeriodResponse> {
  const response = await api.post<PeriodResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePeriod(
  id: string,
  data: any
): Promise<PeriodResponse> {
  const response = await api.put<PeriodResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deletePeriod(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
