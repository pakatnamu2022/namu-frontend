import { api } from "@/src/core/api";
import {
  EquipmentTypeResource,
  EquipmentTypeResponse,
  getEquipmentTypesProps,
} from "@/src/features/gp/tics/equipmentType/lib/equipmentType.interface";
import { AxiosRequestConfig } from "axios";

export async function getEquipmentType({
  params,
}: getEquipmentTypesProps): Promise<EquipmentTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EquipmentTypeResponse>(
    "/equipmentType",
    config
  );
  return data;
}

export async function getAllEquipmentType(): Promise<EquipmentTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<EquipmentTypeResource[]>(
    "/equipmentType",
    config
  );
  return data;
}

export async function storeEquipmentType(
  data: any
): Promise<EquipmentTypeResponse> {
  const response = await api.post<EquipmentTypeResponse>(
    "/equipmentType",
    data
  );
  return response.data;
}
