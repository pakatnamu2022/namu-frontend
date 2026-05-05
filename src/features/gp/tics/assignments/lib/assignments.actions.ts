import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  EquipmentAssignmentListResponse,
  PhoneLineAssignmentListResponse,
  EquipmentAssignmentRequest,
  PhoneLineAssignmentRequest,
  PhoneLineUnassignRequest,
  LinkEquipmentRequest,
  LinkPhoneLineRequest,
  PhoneLineWorkerResource,
  EquipmentAssignmentResource,
} from "./assignments.interface";

export async function getEquipmentAssignments(
  params?: Record<string, any>,
): Promise<EquipmentAssignmentListResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<EquipmentAssignmentListResponse>(
    "/gp/tics/equipmentAssigment",
    config,
  );
  return data;
}

export async function getPhoneLineAssignments(
  params?: Record<string, any>,
): Promise<PhoneLineAssignmentListResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<PhoneLineAssignmentListResponse>(
    "/gp/tics/phoneLineWorker",
    config,
  );
  return data;
}

export async function bulkAssignEquipment(
  payload: EquipmentAssignmentRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    "/gp/tics/equipmentAssigment",
    payload,
  );
  return data;
}

export async function assignPhoneLine(
  payload: PhoneLineAssignmentRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    "/gp/tics/phoneLineWorker",
    payload,
  );
  return data;
}

export async function unassignPhoneLine(
  id: number,
  payload: PhoneLineUnassignRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `/gp/tics/phoneLineWorker/${id}/unassign`,
    payload,
  );
  return data;
}

export async function linkEquipmentToPhoneLine(
  id: number,
  payload: LinkEquipmentRequest,
): Promise<PhoneLineWorkerResource> {
  const { data } = await api.patch<PhoneLineWorkerResource>(
    `/gp/tics/phoneLineWorker/${id}/link-equipment`,
    payload,
  );
  return data;
}

export async function linkPhoneLineToEquipment(
  id: number,
  payload: LinkPhoneLineRequest,
): Promise<EquipmentAssignmentResource> {
  const { data } = await api.patch<EquipmentAssignmentResource>(
    `/gp/tics/equipmentAssigment/${id}/link-phone-line`,
    payload,
  );
  return data;
}
