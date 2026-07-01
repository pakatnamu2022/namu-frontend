import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  AttendanceCodeMappingResource,
  AttendanceCodeMappingResponse,
} from "./attendance-code-mapping.interface";
import { ATTENDANCE_CODE_MAPPING } from "./attendance-code-mapping.constants";

const { ENDPOINT } = ATTENDANCE_CODE_MAPPING;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getAttendanceCodeMappings(
  params?: Record<string, any>,
): Promise<AttendanceCodeMappingResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<AttendanceCodeMappingResponse>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function findAttendanceCodeMappingById(
  id: number,
): Promise<AttendanceCodeMappingResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<AttendanceCodeMappingResource>(data);
}

export async function storeAttendanceCodeMapping(
  payload: any,
): Promise<AttendanceCodeMappingResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<AttendanceCodeMappingResource>(data);
}

export async function updateAttendanceCodeMapping(
  id: number,
  payload: any,
): Promise<AttendanceCodeMappingResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<AttendanceCodeMappingResource>(data);
}

export async function deleteAttendanceCodeMapping(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return unwrap<GeneralResponse>(data);
}
