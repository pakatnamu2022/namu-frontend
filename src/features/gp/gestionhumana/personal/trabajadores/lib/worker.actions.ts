import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getWorkersProps,
  WorkerResource,
  WorkerResponse,
} from "./worker.interface";
import { WORKER } from "./worker.constant";

const { ENDPOINT } = WORKER;

export async function getWorker({
  params,
}: getWorkersProps): Promise<WorkerResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WorkerResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkers({
  params,
}: getWorkersProps): Promise<WorkerResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<WorkerResource[]>(ENDPOINT, config);
  return data;
}

export async function getMyConsultants({
  params,
}: getWorkersProps): Promise<WorkerResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<WorkerResource[]>(`${ENDPOINT}/my-consultants`, config);
  return data;
}

export async function findWorkerById(id: string): Promise<WorkerResource> {
  const response = await api.get<WorkerResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWorker(data: any): Promise<WorkerResponse> {
  const response = await api.post<WorkerResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateWorker(
  id: string,
  data: any
): Promise<WorkerResponse> {
  const response = await api.put<WorkerResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWorker(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getWorkersWithoutObjectives(): Promise<WorkerResource[]> {
  const { data } = await api.get<{ data: WorkerResource[] }>(
    `${ENDPOINT}-without-objectives`
  );
  return data.data;
}

export async function getWorkersWithoutCategories(): Promise<WorkerResource[]> {
  const { data } = await api.get<{ data: WorkerResource[] }>(
    `${ENDPOINT}-without-categories`
  );
  return data.data;
}

export async function getWorkersWithoutCompetences(): Promise<
  WorkerResource[]
> {
  const { data } = await api.get<{ data: WorkerResource[] }>(
    `${ENDPOINT}-without-competences`
  );
  return data.data;
}
