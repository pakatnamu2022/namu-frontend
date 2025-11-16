import { AxiosRequestConfig } from "axios";
import {
  getProductTypeProps,
  ProductTypeResource,
  ProductTypeResponse,
} from "./productType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PRODUCT_TYPE } from "./productType.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

const { ENDPOINT } = PRODUCT_TYPE;

export async function getProductType({
  params,
}: getProductTypeProps): Promise<ProductTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.PRODUCT_TYPE,
    },
  };
  const { data } = await api.get<ProductTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProductType({
  params,
}: getProductTypeProps): Promise<ProductTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<ProductTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductTypeById(
  id: number
): Promise<ProductTypeResource> {
  const response = await api.get<ProductTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProductType(
  data: any
): Promise<ProductTypeResource> {
  const response = await api.post<ProductTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateProductType(
  id: number,
  data: any
): Promise<ProductTypeResource> {
  const response = await api.put<ProductTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteProductType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
