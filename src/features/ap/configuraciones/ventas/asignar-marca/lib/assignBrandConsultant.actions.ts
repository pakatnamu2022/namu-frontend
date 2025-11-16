import { AxiosRequestConfig } from "axios";
import {
  AsesorResource,
  AssignBrandConsultantResource,
  AssignBrandConsultantResponse,
  BrandResource,
  getAssignBrandConsultantProps,
} from "./assignBrandConsultant.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ASSIGN_BRAND_CONSULTANT } from "./assignBrandConsultant.constants";

const { ENDPOINT } = ASSIGN_BRAND_CONSULTANT;

export async function getAssignBrandConsultant({
  params,
}: getAssignBrandConsultantProps): Promise<AssignBrandConsultantResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AssignBrandConsultantResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllBrandsBySede(id: number): Promise<BrandResource[]> {
  const { data } = await api.get<BrandResource[]>(`${ENDPOINT}/${id}/brands`);
  return data;
}

export async function getAllWorkersBySedeAndBrand(
  idSede: number,
  idBrand: number
): Promise<AsesorResource[]> {
  const { data } = await api.get<AsesorResource[]>(
    `${ENDPOINT}/${idSede}/brands/${idBrand}/advisors`
  );
  return data;
}

export async function findAssignBrandConsultantById(
  id: number
): Promise<AssignBrandConsultantResource> {
  const response = await api.get<AssignBrandConsultantResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAssignBrandConsultant(
  data: any
): Promise<AssignBrandConsultantResource> {
  const response = await api.post<AssignBrandConsultantResource>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateAssignBrandConsultant(
  id: number,
  data: any
): Promise<AssignBrandConsultantResource> {
  const response = await api.put<AssignBrandConsultantResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteAssignBrandConsultant(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
