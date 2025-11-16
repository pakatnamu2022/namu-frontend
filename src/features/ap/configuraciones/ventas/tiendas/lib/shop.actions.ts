import { AxiosRequestConfig } from "axios";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { SHOP } from "./shop.constants";
import { getShopProps, ShopResource, ShopResponse } from "./shop.interface";
import {
  AP_MASTER_COMERCIAL,
  COMMERCIAL_MASTERS_ENDPOINT,
} from "@/src/features/ap/lib/ap.constants";

const { ENDPOINT } = SHOP;

export async function getShop({ params }: getShopProps): Promise<ShopResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.SHOP,
    },
  };
  const { data } = await api.get<ShopResponse>(ENDPOINT, config);
  return data;
}

export async function getAllShop({
  params,
}: getShopProps): Promise<ShopResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.SHOP,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ShopResource[]>(
    COMMERCIAL_MASTERS_ENDPOINT,
    config
  );
  return data;
}

export async function findShopById(id: number): Promise<ShopResource> {
  const response = await api.get<ShopResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeShop(data: any): Promise<ShopResource> {
  const response = await api.post<ShopResource>(ENDPOINT, data);
  return response.data;
}

export async function updateShop(id: number, data: any): Promise<ShopResource> {
  const response = await api.put<ShopResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteShop(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
