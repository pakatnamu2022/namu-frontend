import { api } from "@/core/api";
import {
  EquipmentResource,
  EquipmentResponse,
  getEquipmentsProps,
} from "@/features/gp/tics/equipment/lib/equipment.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";

export async function getEquipment({
  params,
}: getEquipmentsProps): Promise<EquipmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EquipmentResponse>("/equipment", config);
  return data;
}

export async function findEquipmentById(
  id: string
): Promise<EquipmentResource> {
  const response = await api.get<EquipmentResource>(`/equipment/${id}`);
  return response.data;
}

export async function storeEquipment(data: any): Promise<EquipmentResponse> {
  const response = await api.post<EquipmentResponse>("/equipment", data);
  return response.data;
}

export async function updateEquipment(
  id: string,
  data: any
): Promise<EquipmentResponse> {
  const response = await api.put<EquipmentResponse>(`/equipment/${id}`, data);
  return response.data;
}

export async function deleteEquipment(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`/equipment/${id}`);
  return data;
}
