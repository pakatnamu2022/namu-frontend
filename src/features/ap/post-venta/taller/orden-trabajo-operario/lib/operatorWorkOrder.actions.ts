import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { OPERATOR_WORKER_ORDER } from "./operatorWorkOrder.constants";
import {
  getOperatorWorkOrderProps,
  OperatorWorkOrderRequest,
  OperatorWorkOrderResource,
  OperatorWorkOrderResponse,
} from "./operatorWorkOrder.interface";

const { ENDPOINT } = OPERATOR_WORKER_ORDER;

export async function getOperatorWorkOrder({
  params,
}: getOperatorWorkOrderProps): Promise<OperatorWorkOrderResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<OperatorWorkOrderResponse>(ENDPOINT, config);
  return data;
}

export async function getAllOperatorWorkOrder({
  params,
}: getOperatorWorkOrderProps): Promise<OperatorWorkOrderResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<OperatorWorkOrderResource[]>(ENDPOINT, config);
  return data;
}

export async function findOperatorWorkOrderById(
  id: number
): Promise<OperatorWorkOrderResource> {
  const response = await api.get<OperatorWorkOrderResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeOperatorWorkOrder(
  data: OperatorWorkOrderRequest
): Promise<OperatorWorkOrderResource> {
  const response = await api.post<OperatorWorkOrderResource>(ENDPOINT, data);
  return response.data;
}

export async function updateOperatorWorkOrder(
  id: number,
  data: OperatorWorkOrderRequest
): Promise<OperatorWorkOrderResource> {
  const response = await api.put<OperatorWorkOrderResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteOperatorWorkOrder(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
