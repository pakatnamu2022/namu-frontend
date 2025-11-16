import { AxiosRequestConfig } from "axios";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { PRODUCT_CATEGORY } from "./productCategory.constants";
import {
  getProductCategoryProps,
  ProductCategoryResource,
  ProductCategoryResponse,
} from "./productCategory.interface";

const { ENDPOINT } = PRODUCT_CATEGORY;

export async function getProductCategory({
  params,
}: getProductCategoryProps): Promise<ProductCategoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      //type: AP_MASTER_COMERCIAL.VEHICLE_TYPE,
    },
  };
  const { data } = await api.get<ProductCategoryResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProductCategory({
  params,
}: getProductCategoryProps): Promise<ProductCategoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      //type: AP_MASTER_COMERCIAL.VEHICLE_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ProductCategoryResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductCategoryById(
  id: number
): Promise<ProductCategoryResource> {
  const response = await api.get<ProductCategoryResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProductCategory(
  data: any
): Promise<ProductCategoryResource> {
  const response = await api.post<ProductCategoryResource>(ENDPOINT, data);
  return response.data;
}

export async function updateProductCategory(
  id: number,
  data: any
): Promise<ProductCategoryResource> {
  const response = await api.put<ProductCategoryResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteProductCategory(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
