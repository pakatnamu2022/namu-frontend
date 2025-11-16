import { AxiosRequestConfig } from "axios";
import {} from "../../categoria/lib/vehicleCategory.interface";
import {
  CategoryChecklistResource,
  CategoryChecklistResponse,
  getCategoryChecklistProps,
} from "./categoryChecklist.interface";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { CATEGORY_CHECKLIST } from "./categoryChecklist.constants";
import { AP_MASTER_COMERCIAL } from "@/src/features/ap/lib/ap.constants";

const { ENDPOINT } = CATEGORY_CHECKLIST;

export async function getCategoryChecklist({
  params,
}: getCategoryChecklistProps): Promise<CategoryChecklistResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.CATEGORIA_CHECKLIST,
    },
  };
  const { data } = await api.get<CategoryChecklistResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCategoryChecklist({
  params,
}: getCategoryChecklistProps): Promise<CategoryChecklistResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.CATEGORIA_CHECKLIST,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<CategoryChecklistResource[]>(ENDPOINT, config);
  return data;
}

export async function findCategoryChecklistById(
  id: number
): Promise<CategoryChecklistResource> {
  const response = await api.get<CategoryChecklistResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeCategoryChecklist(
  data: any
): Promise<CategoryChecklistResource> {
  const response = await api.post<CategoryChecklistResource>(ENDPOINT, data);
  return response.data;
}

export async function updateCategoryChecklist(
  id: number,
  data: any
): Promise<CategoryChecklistResource> {
  const response = await api.put<CategoryChecklistResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteCategoryChecklist(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
