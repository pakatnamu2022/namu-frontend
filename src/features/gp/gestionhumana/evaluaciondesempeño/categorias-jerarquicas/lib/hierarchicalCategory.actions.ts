import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";
import {
  getHierarchicalCategorysProps,
  HierarchicalCategoryResource,
  HierarchicalCategoryResponse,
} from "./hierarchicalCategory.interface";
import { HIERARCHICAL_CATEGORY } from "./hierarchicalCategory.constants";

const { ENDPOINT } = HIERARCHICAL_CATEGORY;

export async function getHierarchicalCategory({
  params,
}: getHierarchicalCategorysProps): Promise<HierarchicalCategoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<HierarchicalCategoryResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllHierarchicalCategory(): Promise<
  HierarchicalCategoryResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<HierarchicalCategoryResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function useAllCategoriesWithBoss(
  idCycle: number
): Promise<HierarchicalCategoryResource[]> {
  const { data } = await api.get<HierarchicalCategoryResource[]>(
    `${ENDPOINT}/listAll`,
    {
      params: {
        idCycle,
      },
    }
  );
  return data;
}

export async function findHierarchicalCategoryById(
  id: number
): Promise<HierarchicalCategoryResource> {
  const response = await api.get<HierarchicalCategoryResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeHierarchicalCategory(
  data: any
): Promise<HierarchicalCategoryResponse> {
  const response = await api.post<HierarchicalCategoryResponse>(ENDPOINT, data);
  return response.data;
}

export async function storeHierarchicalCategoryDetails(
  id: number,
  data: any
): Promise<HierarchicalCategoryResponse> {
  const response = await api.post<HierarchicalCategoryResponse>(
    `${ENDPOINT}/${id}/details`,
    data
  );
  return response.data;
}

export async function updateHierarchicalCategory(
  id: string,
  data: any
): Promise<HierarchicalCategoryResponse> {
  const response = await api.put<HierarchicalCategoryResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteHierarchicalCategory(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function deleteHierarchicalCategoryDetail(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `/gp/gh/performanceEvaluation/hierarchicalCategoryDetail/${id}`
  );
  return data;
}
