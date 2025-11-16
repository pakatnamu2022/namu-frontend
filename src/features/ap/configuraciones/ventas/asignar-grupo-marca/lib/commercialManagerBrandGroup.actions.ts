import type { AxiosRequestConfig } from "axios";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "./commercialManagerBrandGroup.constants";
import {
  CommercialManagerBrandGroupResource,
  CommercialManagerBrandGroupResponse,
  getCommercialManagerBrandGroupProps,
} from "./commercialManagerBrandGroup.interface";
import { api } from "@/core/api";

const { ENDPOINT } = COMMERCIAL_MANAGER_BRAND_GROUP;

export async function getCommercialManagerBrandGroup({
  params,
}: getCommercialManagerBrandGroupProps): Promise<CommercialManagerBrandGroupResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CommercialManagerBrandGroupResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findCommercialManagerBrandGroupById(
  id: number
): Promise<CommercialManagerBrandGroupResource> {
  const response = await api.get<CommercialManagerBrandGroupResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeCommercialManagerBrandGroup(
  data: any
): Promise<CommercialManagerBrandGroupResource> {
  const response = await api.post<CommercialManagerBrandGroupResource>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateCommercialManagerBrandGroup(
  id: number,
  data: any
): Promise<CommercialManagerBrandGroupResource> {
  const response = await api.put<CommercialManagerBrandGroupResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}
