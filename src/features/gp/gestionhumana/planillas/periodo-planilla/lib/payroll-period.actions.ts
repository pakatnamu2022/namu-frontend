import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getPayrollPeriodsProps,
  PayrollPeriodResource,
  PayrollPeriodResponse,
} from "./payroll-period.interface";
import { PAYROLL_PERIOD } from "./payroll-period.constant";

const { ENDPOINT } = PAYROLL_PERIOD;

export async function getPayrollPeriods({
  params,
}: getPayrollPeriodsProps): Promise<PayrollPeriodResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PayrollPeriodResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPayrollPeriods(): Promise<PayrollPeriodResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<PayrollPeriodResource[]>(ENDPOINT, config);
  return data;
}

export async function findPayrollPeriodById(
  id: string
): Promise<PayrollPeriodResource> {
  const response = await api.get<PayrollPeriodResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function getCurrentPayrollPeriod(): Promise<PayrollPeriodResource> {
  const response = await api.get<PayrollPeriodResource>(`${ENDPOINT}/current`);
  return response.data;
}

export async function storePayrollPeriod(data: any): Promise<PayrollPeriodResponse> {
  const response = await api.post<PayrollPeriodResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePayrollPeriod(
  id: string,
  data: any
): Promise<PayrollPeriodResponse> {
  const response = await api.put<PayrollPeriodResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deletePayrollPeriod(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function closePayrollPeriod(id: number): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(`${ENDPOINT}/${id}/close`);
  return data;
}
