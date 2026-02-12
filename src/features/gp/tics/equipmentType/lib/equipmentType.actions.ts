import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  EquipmentTypeResource,
  EquipmentTypeResponse,
  getEquipmentTypesProps,
} from "@/features/gp/tics/equipmentType/lib/equipmentType.interface";
import type { AxiosRequestConfig } from "axios";
import { EQUIPMENT_TYPE } from "./equipmentType.constants";

const { ENDPOINT } = EQUIPMENT_TYPE;

export async function getEquipmentType({
  params,
}: getEquipmentTypesProps): Promise<EquipmentTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EquipmentTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllEquipmentType(): Promise<EquipmentTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<EquipmentTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findEquipmentTypeById(
  id: number
): Promise<EquipmentTypeResource> {
  const response = await api.get<EquipmentTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeEquipmentType(
  data: any
): Promise<EquipmentTypeResponse> {
  const response = await api.post<EquipmentTypeResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateEquipmentType(
  id: number,
  data: any
): Promise<EquipmentTypeResponse> {
  const response = await api.put<EquipmentTypeResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteEquipmentType(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
