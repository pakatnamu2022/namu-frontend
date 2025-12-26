import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { WORKER_ORDER_LABOUR } from "./workOrderLabour.constants";
import {
  getWorkOrderLabourProps,
  WorkOrderLabourRequest,
  WorkOrderLabourResource,
  WorkOrderLabourResponse,
} from "./workOrderLabour.interface";

const { ENDPOINT } = WORKER_ORDER_LABOUR;

export async function getWorkOrderLabour({
  params,
}: getWorkOrderLabourProps): Promise<WorkOrderLabourResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<WorkOrderLabourResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkOrderLabour({
  params,
}: getWorkOrderLabourProps): Promise<WorkOrderLabourResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WorkOrderLabourResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkOrderLabourById(
  id: number
): Promise<WorkOrderLabourResource> {
  const response = await api.get<WorkOrderLabourResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWorkOrderLabour(
  data: WorkOrderLabourRequest
): Promise<WorkOrderLabourResource> {
  const response = await api.post<WorkOrderLabourResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkOrderLabour(
  id: number,
  data: WorkOrderLabourRequest
): Promise<WorkOrderLabourResource> {
  const response = await api.put<WorkOrderLabourResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteWorkOrderLabour(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}


