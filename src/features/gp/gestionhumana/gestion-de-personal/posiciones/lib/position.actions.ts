import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getPositionsProps,
  PositionResource,
  PositionResponse,
  AreaResource,
} from "./position.interface.ts";
import { POSITION } from "./position.constant.ts";

const { ENDPOINT } = POSITION;

export async function getPosition({
  params,
}: getPositionsProps): Promise<PositionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PositionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPositions({
  params,
}: getPositionsProps): Promise<PositionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<PositionResource[]>(ENDPOINT, config);
  return data;
}

export async function findPositionById(id: string): Promise<PositionResource> {
  const response = await api.get<PositionResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePosition(formData: any): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updatePosition(
  id: string,
  formData: any
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(
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

export async function deletePosition(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getAreas(): Promise<AreaResource[]> {
  const { data } = await api.get<AreaResource[]>("/gp/gh/personal/area");
  return data;
}
export async function getAllAreas(): Promise<AreaResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<AreaResource[]>(
    "/gp/gh/personal/area",
    config
  );
  return data;
}
