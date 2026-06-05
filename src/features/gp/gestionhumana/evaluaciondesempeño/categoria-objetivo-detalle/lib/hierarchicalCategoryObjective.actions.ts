import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  ApplyReferenceWeightsPayload,
  CategoryObjectivePersonResponse,
  CategoryWeightReport,
  getHierarchicalCategoryObjectivesProps,
  GlobalWeightReportItem,
  HierarchicalCategoryObjectiveResource,
  HierarchicalCategoryObjectiveResponse,
} from "./hierarchicalCategoryObjective.interface";
import { CATEGORY_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";

const { ENDPOINT } = CATEGORY_OBJECTIVE;

export async function getHierarchicalCategoryObjective({
  params,
}: getHierarchicalCategoryObjectivesProps): Promise<HierarchicalCategoryObjectiveResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<HierarchicalCategoryObjectiveResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllHierarchicalCategoryObjective(): Promise<
  HierarchicalCategoryObjectiveResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<HierarchicalCategoryObjectiveResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findHierarchicalCategoryObjectiveById(
  id: number
): Promise<HierarchicalCategoryObjectiveResource> {
  const response = await api.get<HierarchicalCategoryObjectiveResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function getCategoryObjectivePersonById(
  id: number
): Promise<CategoryObjectivePersonResponse[]> {
  const response = await api.get<CategoryObjectivePersonResponse[]>(
    `${ENDPOINT}/${id}/workers`
  );
  return response.data;
}

export async function storeHierarchicalCategoryObjective(
  data: any
): Promise<HierarchicalCategoryObjectiveResponse> {
  const response = await api.post<HierarchicalCategoryObjectiveResponse>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateHierarchicalCategoryObjective(
  id: number,
  data: any
): Promise<HierarchicalCategoryObjectiveResponse> {
  const response = await api.put<HierarchicalCategoryObjectiveResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteHierarchicalCategoryObjective(body: {
  category_id: number;
  objective_id: number;
}): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(`${ENDPOINT}/destroy`, body);
  return data;
}

export async function regeneratePersonObjectives(
  categoryId: number,
  personId: number
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${categoryId}/regenerate-person/${personId}`
  );
  return data;
}

export async function homogeneousWeightsPerson(
  categoryId: number,
  personId: number
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${categoryId}/homogeneous-weights/${personId}`
  );
  return data;
}

export async function getGlobalWeightReport(): Promise<GlobalWeightReportItem[]> {
  const { data } = await api.get<GlobalWeightReportItem[]>(
    `${ENDPOINT}/global-weight-report`
  );
  return data;
}

export async function getCategoryWeightReport(
  categoryId: number
): Promise<CategoryWeightReport> {
  const { data } = await api.get<CategoryWeightReport>(
    `${ENDPOINT}/${categoryId}/weight-report`
  );
  return data;
}

export async function applyReferenceWeights(
  categoryId: number,
  payload: ApplyReferenceWeightsPayload
): Promise<CategoryWeightReport> {
  const { data } = await api.post<CategoryWeightReport>(
    `${ENDPOINT}/${categoryId}/apply-reference-weights`,
    payload
  );
  return data;
}
