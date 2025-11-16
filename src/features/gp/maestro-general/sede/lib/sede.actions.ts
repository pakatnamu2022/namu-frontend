import { api } from "@/src/core/api";
import { AxiosRequestConfig } from "axios";
import { getSedesProps, SedeResource, SedeResponse } from "./sede.interface";
import { SEDE } from "@/src/features/gp/maestro-general/sede/lib/sede.constants";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { ShopSedeResource } from "@/src/features/ap/configuraciones/ventas/tiendas/lib/shop.interface";

const { ENDPOINT } = SEDE;

export async function getSede({
  params,
}: getSedesProps): Promise<SedeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<SedeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllSede(
  params: Record<string, any> = {}
): Promise<SedeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<SedeResource[]>(ENDPOINT, config);
  return data;
}

export async function getMySede({
  params,
}: getSedesProps): Promise<SedeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<SedeResource[]>(`${ENDPOINT}/my`, config);
  return data;
}

export async function getAllAvailableLocationsShop(
  params: Record<string, any> = {}
): Promise<ShopSedeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ShopSedeResource[]>(
    `${ENDPOINT}/availableLocationsShop`,
    config
  );
  return data;
}

export async function findSedeById(id: number): Promise<SedeResource> {
  const response = await api.get<SedeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeSede(data: any): Promise<SedeResource> {
  const response = await api.post<SedeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateSede(id: number, data: any): Promise<SedeResource> {
  const response = await api.put<SedeResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteSede(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
