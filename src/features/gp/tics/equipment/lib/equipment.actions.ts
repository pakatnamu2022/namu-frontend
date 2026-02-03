import { api } from "@/core/api";
import {
  EquipmentResource,
  EquipmentResponse,
  EquipmentAssignmentResource,
  EquipmentAssignmentRequest,
  EquipmentUnassignRequest,
  getEquipmentsProps,
} from "@/features/gp/tics/equipment/lib/equipment.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { EQUIPMENT } from "./equipment.constants";

const { ENDPOINT } = EQUIPMENT;

export async function getEquipment({
  params,
}: getEquipmentsProps): Promise<EquipmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EquipmentResponse>(ENDPOINT, config);
  return data;
}

export async function findEquipmentById(
  id: string
): Promise<EquipmentResource> {
  const response = await api.get<EquipmentResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeEquipment(data: any): Promise<EquipmentResponse> {
  const response = await api.post<EquipmentResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateEquipment(
  id: string,
  data: any
): Promise<EquipmentResponse> {
  const response = await api.put<EquipmentResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteEquipment(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function assignEquipment(
  payload: EquipmentAssignmentRequest
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    "/gp/tics/equipmentAssigment",
    payload
  );
  return data;
}

export async function getEquipmentHistory(
  equipoId: number
): Promise<EquipmentAssignmentResource[]> {
  const { data } = await api.get<EquipmentAssignmentResource[]>(
    `/gp/tics/equipmentAssigment/history/equipment/${equipoId}`
  );
  return data;
}

export async function unassignEquipment(
  assignmentId: number,
  payload: EquipmentUnassignRequest
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `/gp/tics/equipmentAssigment/${assignmentId}/unassign`,
    payload
  );
  return data;
}
