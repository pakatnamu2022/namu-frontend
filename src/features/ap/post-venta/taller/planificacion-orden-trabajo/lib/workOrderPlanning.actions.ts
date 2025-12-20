import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  WorkOrderPlanningRequest,
  WorkOrderPlanningResponse,
  WorkOrderPlanningResource,
  WorkOrderPlanningSessionRequest,
  PauseWorkRequest,
  getWorkOrderPlanningProps,
  ConsolidatedPlanning,
} from "./workOrderPlanning.interface";
import { WORK_ORDER_PLANNING } from "./workOrderPlanning.constants";

const { ENDPOINT } = WORK_ORDER_PLANNING;

export async function getWorkOrderPlanning({
  params,
}: getWorkOrderPlanningProps = {}): Promise<WorkOrderPlanningResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<WorkOrderPlanningResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkOrderPlanning({
  params,
}: getWorkOrderPlanningProps = {}): Promise<WorkOrderPlanningResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<WorkOrderPlanningResource[]>(ENDPOINT, config);
  return data;
}

export async function findWorkOrderPlanningById(
  id: number
): Promise<WorkOrderPlanningResource> {
  const response = await api.get<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeWorkOrderPlanning(
  data: WorkOrderPlanningRequest
): Promise<WorkOrderPlanningResource> {
  const response = await api.post<WorkOrderPlanningResource>(ENDPOINT, data);
  return response.data;
}

export async function updateWorkOrderPlanning(
  id: number,
  data: Partial<WorkOrderPlanningRequest>
): Promise<WorkOrderPlanningResource> {
  const response = await api.put<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteWorkOrderPlanning(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

// Session Actions
export async function startSession(
  id: number,
  requestData?: WorkOrderPlanningSessionRequest
): Promise<WorkOrderPlanningResource> {
  const response = await api.post<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}/start`,
    requestData
  );
  return response.data;
}

export async function pauseWork(
  id: number,
  requestData?: PauseWorkRequest
): Promise<WorkOrderPlanningResource> {
  const response = await api.post<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}/pause`,
    requestData
  );
  return response.data;
}

export async function completeWork(
  id: number
): Promise<WorkOrderPlanningResource> {
  const response = await api.post<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}/complete`
  );
  return response.data;
}

export async function cancelPlanning(
  id: number
): Promise<WorkOrderPlanningResource> {
  const response = await api.post<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}/cancel`
  );
  return response.data;
}

export async function getStatusPlanning(
  id: number
): Promise<WorkOrderPlanningResource> {
  const response = await api.get<WorkOrderPlanningResource>(
    `${ENDPOINT}/${id}/status`
  );
  return response.data;
}

export async function getSessions(id: number) {
  const response = await api.get(`${ENDPOINT}/${id}/sessions`);
  return response.data;
}

export async function getConsolidatedPlanning(
  workOrderId: number
): Promise<ConsolidatedPlanning[]> {
  const response = await api.get<ConsolidatedPlanning[]>(
    `${ENDPOINT}/consolidated/${workOrderId}`
  );
  return response.data;
}
