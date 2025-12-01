import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  BrandsResource,
  BrandsResponse,
  getBrandsProps,
} from "./brands.interface";
import { BrandsSchema } from "./brands.schema";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { BRAND } from "./brands.constants";

const { ENDPOINT } = BRAND;

export async function getBrands({
  params,
}: getBrandsProps): Promise<BrandsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<BrandsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBrands({
  params,
}: getBrandsProps): Promise<BrandsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<BrandsResource[]>(ENDPOINT, config);
  return data;
}

export async function findBrandsById(id: number): Promise<BrandsResource> {
  const response = await api.get<BrandsResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBrands(data: BrandsSchema): Promise<BrandsResource> {
  const formData = createBrandFormData(data);

  const response = await api.post<BrandsResource>(ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateBrands(
  id: number,
  data: Partial<BrandsSchema>
): Promise<BrandsResource> {
  const formData = createBrandFormData(data);

  const response = await api.post<BrandsResource>(
    `${ENDPOINT}/${id}?_method=PUT`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function deleteBrand(id: number): Promise<BrandsResponse> {
  const { data } = await api.delete<BrandsResponse>(`${ENDPOINT}/${id}`);
  return data;
}

function createBrandFormData(
  data: BrandsSchema | Partial<BrandsSchema>
): FormData {
  const formData = new FormData();

  if (data.code) formData.append("code", data.code);
  if (data.dyn_code) formData.append("dyn_code", data.dyn_code);
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.group_id) formData.append("group_id", data.group_id);

  if (data.logo instanceof File) {
    formData.append("logo", data.logo);
  }

  if (data.logo_min instanceof File) {
    formData.append("logo_min", data.logo_min);
  }

  if (data.type_operation_id !== null && data.type_operation_id !== undefined) {
    formData.append("type_operation_id", String(data.type_operation_id));
  }

  if (data.status !== null && data.status !== undefined) {
    formData.append("status", data.status ? "1" : "0");
  }

  return formData;
}
