import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getViewsProps,
  View,
  ViewResource,
  ViewResponse,
} from "./view.interface";
import { VIEW } from "./view.constants";

const { ENDPOINT } = VIEW;

export async function getView({
  params,
}: getViewsProps): Promise<ViewResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ViewResponse>(ENDPOINT, config);
  return data;
}

export async function getViewPermission({
  params,
}: getViewsProps): Promise<View[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<View[]>(
    `${ENDPOINT}/with-permissions`,
    config
  );
  return data;
}

export async function getAllView(): Promise<ViewResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      sort: "descripcion",
      direction: "asc",
    },
  };
  const { data } = await api.get<ViewResource[]>(ENDPOINT, config);
  return data;
}

export async function findViewById(id: string): Promise<ViewResource> {
  const response = await api.get<ViewResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeView(data: any): Promise<ViewResponse> {
  const response = await api.post<ViewResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateView(id: number, data: any): Promise<ViewResponse> {
  const response = await api.put<ViewResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteView(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
