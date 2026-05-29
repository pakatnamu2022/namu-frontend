import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getObjectivesProps,
  ObjectiveResource,
  ObjectiveResponse,
  ActivateInCategoriesPreviewResponse,
  ActivateInCategoriesResponse,
} from "./objective.interface";
import { OBJECTIVE } from "./objective.constants";

const { ENDPOINT } = OBJECTIVE;

export async function getObjective({
  params,
}: getObjectivesProps): Promise<ObjectiveResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ObjectiveResponse>(ENDPOINT, config);
  return data;
}

export async function getAllObjective({
  params,
}: getObjectivesProps): Promise<ObjectiveResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<ObjectiveResource[]>(ENDPOINT, config);
  return data;
}

export async function findObjectiveById(
  id: string
): Promise<ObjectiveResource> {
  const response = await api.get<ObjectiveResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeObjective(data: any): Promise<ObjectiveResponse> {
  const response = await api.post<ObjectiveResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateObjective(
  id: string,
  data: any
): Promise<ObjectiveResponse> {
  const response = await api.put<ObjectiveResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function updateGoalObjective(
  id: number,
  data: { goalReference: number }
): Promise<ObjectiveResponse> {
  const response = await api.put<ObjectiveResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function updateWeightObjective(
  id: number,
  data: { fixedWeight: number }
): Promise<ObjectiveResponse> {
  const response = await api.put<ObjectiveResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteObjective(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getActivateInCategoriesPreview(
  id: number
): Promise<ActivateInCategoriesPreviewResponse> {
  const { data } = await api.get<ActivateInCategoriesPreviewResponse>(
    `${ENDPOINT}/${id}/activate-in-categories/preview`
  );
  return data;
}

export async function activateObjectiveInCategories(
  id: number,
  categoryIds?: number[]
): Promise<ActivateInCategoriesResponse> {
  const body = categoryIds ? { category_ids: categoryIds } : undefined;
  const { data } = await api.post<ActivateInCategoriesResponse>(
    `${ENDPOINT}/${id}/activate-in-categories`,
    body
  );
  return data;
}
