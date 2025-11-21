import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getParEvaluatorsProps,
  ParEvaluatorResource,
  ParEvaluatorResponse,
} from "./par-evaluator.interface";
import { PAR_EVALUATOR } from "./par-evaluator.constant";

const { ENDPOINT } = PAR_EVALUATOR;

export async function getParEvaluator({
  params,
}: getParEvaluatorsProps): Promise<ParEvaluatorResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ParEvaluatorResponse>(ENDPOINT, config);
  return data;
}

export async function getAllParEvaluators({
  params,
}: getParEvaluatorsProps): Promise<ParEvaluatorResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<ParEvaluatorResource[]>(ENDPOINT, config);
  return data;
}

export async function findParEvaluatorById(
  id: string
): Promise<ParEvaluatorResource> {
  const response = await api.get<ParEvaluatorResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeParEvaluator(
  data: any
): Promise<ParEvaluatorResponse> {
  const response = await api.post<ParEvaluatorResponse>(ENDPOINT, data);
  return response.data;
}

export async function storeMultipleParEvaluators(data: {
  worker_id: number;
  mate_ids: number[];
}): Promise<any> {
  const response = await api.post<any>(`${ENDPOINT}`, data);
  return response.data;
}

export async function updateParEvaluator(
  id: string,
  data: any
): Promise<ParEvaluatorResponse> {
  const response = await api.put<ParEvaluatorResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function updateMultipleParEvaluators(data: {
  worker_id: number;
  mate_ids: number[];
}): Promise<any> {
  const response = await api.put<any>(`${ENDPOINT}/bulk/${data.worker_id}`, {
    mate_ids: data.mate_ids,
  });
  return response.data;
}

export async function deleteParEvaluator(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getParEvaluatorsWithoutObjectives(): Promise<
  ParEvaluatorResource[]
> {
  const { data } = await api.get<{ data: ParEvaluatorResource[] }>(
    `${ENDPOINT}-without-objectives`
  );
  return data.data;
}

export async function getParEvaluatorsWithoutCategories(): Promise<
  ParEvaluatorResource[]
> {
  const { data } = await api.get<{ data: ParEvaluatorResource[] }>(
    `${ENDPOINT}-without-categories`
  );
  return data.data;
}

export async function getParEvaluatorsWithoutCompetences(): Promise<
  ParEvaluatorResource[]
> {
  const { data } = await api.get<{ data: ParEvaluatorResource[] }>(
    `${ENDPOINT}-without-competences`
  );
  return data.data;
}
