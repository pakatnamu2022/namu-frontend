import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PER_DIEM_CATEGORY } from "./perDiemCategory.constants";
import {
  getPerDiemCategoryProps,
  PerDiemCategoryRequest,
  PerDiemCategoryResource,
  PerDiemCategoryResponse,
} from "./perDiemCategory.interface";

const { ENDPOINT } = PER_DIEM_CATEGORY;

export async function getPerDiemCategory({
  params,
}: getPerDiemCategoryProps): Promise<PerDiemCategoryResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemCategoryResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPerDiemCategory({
  params,
}: getPerDiemCategoryProps): Promise<PerDiemCategoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<PerDiemCategoryResource[]>(ENDPOINT, config);
  return data;
}

export async function findPerDiemCategoryById(
  id: number
): Promise<PerDiemCategoryResource> {
  const response = await api.get<PerDiemCategoryResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePerDiemCategory(
  data: PerDiemCategoryRequest
): Promise<PerDiemCategoryResource> {
  const response = await api.post<PerDiemCategoryResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePerDiemCategory(
  id: number,
  data: any
): Promise<PerDiemCategoryResource> {
  const response = await api.put<PerDiemCategoryResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePerDiemCategory(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
