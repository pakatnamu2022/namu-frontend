import { api } from "@/core/api";
import { AxiosRequestConfig } from "axios";
import {
  BrandGroupResource,
  BrandGroupResponse,
  getBrandGroupProps,
} from "./brandGroup.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { BRAND_GROUP } from "./brandGroup.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

const { ENDPOINT } = BRAND_GROUP;

export async function getBrandGroup({
  params,
}: getBrandGroupProps): Promise<BrandGroupResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.GROUP_BRANDS,
    },
  };
  const { data } = await api.get<BrandGroupResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBrandGroup({
  params,
}: getBrandGroupProps): Promise<BrandGroupResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.GROUP_BRANDS,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<BrandGroupResource[]>(ENDPOINT, config);
  return data;
}

export async function findBrandGroupById(
  id: number
): Promise<BrandGroupResource> {
  const response = await api.get<BrandGroupResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBrandGroup(data: any): Promise<BrandGroupResource> {
  const response = await api.post<BrandGroupResource>(ENDPOINT, data);
  return response.data;
}

export async function updateBrandGroup(
  id: number,
  data: any
): Promise<BrandGroupResource> {
  const response = await api.put<BrandGroupResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBrandGroup(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
