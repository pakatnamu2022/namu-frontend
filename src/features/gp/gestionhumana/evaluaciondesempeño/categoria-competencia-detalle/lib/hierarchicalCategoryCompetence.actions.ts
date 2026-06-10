import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  CategoryCompetencePersonResponse,
  CategoryCompetenceReport,
  getHierarchicalCategoryCompetencesProps,
  GlobalCompetenceReportItem,
  HierarchicalCategoryCompetenceResource,
  HierarchicalCategoryCompetenceResponse,
} from "./hierarchicalCategoryCompetence.interface";
import { CATEGORY_COMPETENCE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.constants";

const { ENDPOINT } = CATEGORY_COMPETENCE;

export async function getHierarchicalCategoryCompetence({
  params,
}: getHierarchicalCategoryCompetencesProps): Promise<HierarchicalCategoryCompetenceResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<HierarchicalCategoryCompetenceResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllHierarchicalCategoryCompetence(): Promise<
  HierarchicalCategoryCompetenceResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<HierarchicalCategoryCompetenceResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findHierarchicalCategoryCompetenceById(
  id: number
): Promise<HierarchicalCategoryCompetenceResource> {
  const response = await api.get<HierarchicalCategoryCompetenceResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function getCategoryCompetencePersonById(
  id: number
): Promise<CategoryCompetencePersonResponse[]> {
  const response = await api.get<CategoryCompetencePersonResponse[]>(
    `${ENDPOINT}/${id}/workers`
  );
  return response.data;
}

export async function storeHierarchicalCategoryCompetence(
  data: any
): Promise<HierarchicalCategoryCompetenceResponse> {
  const response = await api.post<HierarchicalCategoryCompetenceResponse>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateHierarchicalCategoryCompetence(
  id: number,
  data: any
): Promise<HierarchicalCategoryCompetenceResponse> {
  const response = await api.put<HierarchicalCategoryCompetenceResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteHierarchicalCategoryCompetence(body: {
  category_id: number;
  competence_id: number;
}): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(`${ENDPOINT}/destroy`, body);
  return data;
}

export async function getGlobalAssignmentReport(): Promise<GlobalCompetenceReportItem[]> {
  const { data } = await api.get<GlobalCompetenceReportItem[]>(
    `${ENDPOINT}/global-assignment-report`
  );
  return data;
}

export async function getCategoryAssignmentReport(
  categoryId: number
): Promise<CategoryCompetenceReport> {
  const { data } = await api.get<CategoryCompetenceReport>(
    `${ENDPOINT}/${categoryId}/assignment-report`
  );
  return data;
}

export async function regeneratePersonCompetences(
  categoryId: number,
  personId: number
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${categoryId}/regenerate-person/${personId}`
  );
  return data;
}

export interface FillAllMissingResponse {
  message: string;
  categories_processed: number;
  assignments_created: number;
}

export async function fillAllMissingCompetences(): Promise<FillAllMissingResponse> {
  const { data } = await api.post<FillAllMissingResponse>(
    `${ENDPOINT}/fill-all-missing`
  );
  return data;
}
