import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getCyclesProps,
  CycleResource,
  CycleResponse,
  WeightsPreviewResponse,
} from "./cycle.interface";
import {
  CyclePersonDetailResource,
  CyclePersonDetailResponse,
} from "./cyclePersonDetail";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface";
import { CYCLE, ENDPOINT_DETAIL } from "./cycle.constants";

const { ENDPOINT } = CYCLE;

export async function getCycle({
  params,
}: getCyclesProps): Promise<CycleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CycleResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCycle({
  params,
}: getCyclesProps): Promise<CycleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<CycleResource[]>(ENDPOINT, config);
  return data;
}

export async function findCycleById(id: string): Promise<CycleResource> {
  const response = await api.get<CycleResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function getCyclePersonDetails(
  id: string,
  params?: Record<string, any>,
): Promise<CyclePersonDetailResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CyclePersonDetailResponse>(
    `${ENDPOINT}/${id}/details`,
    config,
  );
  return data;
}

interface WorkerResponseInCycle {
  data: WorkerResource[];
}

export async function getPersonsInCycle(
  id: string,
): Promise<WorkerResponseInCycle> {
  const { data } = await api.get<WorkerResponseInCycle>(
    `${ENDPOINT}/${id}/participants`,
  );
  return data;
}

export async function getPositionsInCycle(
  id: string,
): Promise<PositionResource[]> {
  const { data } = await api.get<PositionResource[]>(
    `${ENDPOINT}/${id}/positions`,
  );
  return data;
}

export interface RootObject {
  hierarchical_category_id: number;
  hierarchical_category: string;
}

export async function getCategoriesInCycle(id: string): Promise<RootObject[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: "true",
    },
  };
  const { data } = await api.get<RootObject[]>(
    `${ENDPOINT}/${id}/categories`,
    config,
  );
  return data;
}

export async function getChiefsInCycle(id: string): Promise<WorkerResource[]> {
  const { data } = await api.get<WorkerResource[]>(
    `/gp/gh/performanceEvaluation/cycle/${id}/chiefs`,
  );
  return data;
}

export async function storeCycle(data: any): Promise<CycleResponse> {
  const response = await api.post<CycleResponse>(ENDPOINT, data);
  return response.data;
}

export async function assignCategoriesToCycle(
  id: number,
  data: { categories: string[] },
): Promise<any> {
  const response = await api.post<any>(`${ENDPOINT}/${id}/categories`, data);
  return response.data;
}

export async function updateCycle(
  id: string,
  data: any,
): Promise<CycleResponse> {
  const response = await api.put<CycleResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function updateGoalCyclePersonDetail(
  id: number,
  data: { goal?: number; weight?: number },
): Promise<CyclePersonDetailResource> {
  const response = await api.put<CyclePersonDetailResource>(
    `${ENDPOINT_DETAIL}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteCycle(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function deleteCyclePersonDetail(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `${ENDPOINT_DETAIL}/${id}`,
  );
  return data;
}

export async function getCycleWeightsPreview(
  cycleId: number,
): Promise<WeightsPreviewResponse> {
  const { data } = await api.get<WeightsPreviewResponse>(
    `${ENDPOINT}/${cycleId}/weights/preview`,
  );
  return data;
}

export async function regenerateCycleWeights(
  cycleId: number,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${cycleId}/weights/regenerate`,
  );
  return data;
}

export async function getEligibleWorkers(
  cycleId: number,
): Promise<WorkerResource[]> {
  const { data } = await api.get<WorkerResource[]>(
    `${ENDPOINT}/${cycleId}/eligible-workers`,
  );
  return data;
}

export async function assignWorkersToCycle(
  cycleId: number,
  workerIds: number[],
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${cycleId}/workers`,
    { worker_ids: workerIds },
  );
  return data;
}