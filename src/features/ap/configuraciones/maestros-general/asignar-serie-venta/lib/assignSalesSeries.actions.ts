import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ASSIGN_SALES_SERIES } from "./assignSalesSeries.constants";
import {
  AssignSalesSeriesResource,
  AssignSalesSeriesResponse,
  getAssignSalesSeriesProps,
} from "./assignSalesSeries.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";

const { ENDPOINT } = ASSIGN_SALES_SERIES;

export async function getAssignSalesSeries({
  params,
}: getAssignSalesSeriesProps): Promise<AssignSalesSeriesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AssignSalesSeriesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllAssignSalesSeries({
  params,
}: getAssignSalesSeriesProps): Promise<AssignSalesSeriesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<AssignSalesSeriesResource[]>(ENDPOINT, config);
  return data;
}

export async function findAssignSalesSeriesById(
  id: number
): Promise<AssignSalesSeriesResource> {
  const response = await api.get<AssignSalesSeriesResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAssignSalesSeries(
  data: any
): Promise<AssignSalesSeriesResource> {
  const response = await api.post<AssignSalesSeriesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateAssignSalesSeries(
  id: number,
  data: any
): Promise<AssignSalesSeriesResource> {
  const response = await api.put<AssignSalesSeriesResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteAssignSalesSeries(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
