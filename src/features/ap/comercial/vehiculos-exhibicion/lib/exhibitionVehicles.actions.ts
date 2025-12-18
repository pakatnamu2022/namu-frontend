import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { EXHIBITION_VEHICLES } from "./exhibitionVehicles.constants";
import {
  getExhibitionVehiclesProps,
  ExhibitionVehiclesRequest,
  ExhibitionVehiclesResource,
  ExhibitionVehiclesResponse,
} from "./exhibitionVehicles.interface";

const { ENDPOINT } = EXHIBITION_VEHICLES;

export async function getExhibitionVehicles({
  params,
}: getExhibitionVehiclesProps): Promise<ExhibitionVehiclesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ExhibitionVehiclesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllExhibitionVehicles({
  params,
}: getExhibitionVehiclesProps): Promise<ExhibitionVehiclesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<ExhibitionVehiclesResource[]>(ENDPOINT, config);
  return data;
}

export async function getExhibitionVehiclesById(
  id: number
): Promise<ExhibitionVehiclesResource> {
  const { data } = await api.get<ExhibitionVehiclesResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findExhibitionVehiclesById(
  id: number
): Promise<ExhibitionVehiclesResource> {
  const response = await api.get<ExhibitionVehiclesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeExhibitionVehicles(
  payload: ExhibitionVehiclesRequest
): Promise<ExhibitionVehiclesResource> {
  const { data } = await api.post<ExhibitionVehiclesResource>(ENDPOINT, payload);
  return data;
}

export async function updateExhibitionVehicles(
  id: number,
  payload: ExhibitionVehiclesRequest
): Promise<ExhibitionVehiclesResource> {
  const { data } = await api.put<ExhibitionVehiclesResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteExhibitionVehicles(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
