import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  AttendanceExclusionResource,
  AttendanceExclusionResponse,
} from "./attendance-exclusion.interface";
import { ATTENDANCE_EXCLUSION } from "./attendance-exclusion.constants";

const { ENDPOINT } = ATTENDANCE_EXCLUSION;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getAttendanceExclusions(
  params?: Record<string, any>,
): Promise<AttendanceExclusionResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<AttendanceExclusionResponse>(ENDPOINT, config);
  return data;
}

export async function findAttendanceExclusionById(
  id: number,
): Promise<AttendanceExclusionResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<AttendanceExclusionResource>(data);
}

export async function storeAttendanceExclusion(
  payload: any,
): Promise<AttendanceExclusionResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<AttendanceExclusionResource>(data);
}

export async function updateAttendanceExclusion(
  id: number,
  payload: any,
): Promise<AttendanceExclusionResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<AttendanceExclusionResource>(data);
}

export async function deleteAttendanceExclusion(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return unwrap<GeneralResponse>(data);
}
