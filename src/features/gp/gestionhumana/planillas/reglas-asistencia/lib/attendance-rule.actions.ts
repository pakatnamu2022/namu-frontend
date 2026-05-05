import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  AttendanceRuleResource,
  AttendanceRuleResponse,
} from "./attendance-rule.interface";
import { ATTENDANCE_RULE } from "./attendance-rule.constant";

const { ENDPOINT } = ATTENDANCE_RULE;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getAttendanceRules(
  params?: Record<string, any>,
): Promise<AttendanceRuleResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<AttendanceRuleResponse>(ENDPOINT, config);
  return data;
}

export async function findAttendanceRuleById(
  id: number,
): Promise<AttendanceRuleResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<AttendanceRuleResource>(data);
}

export async function storeAttendanceRule(
  payload: any,
): Promise<AttendanceRuleResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<AttendanceRuleResource>(data);
}

export async function updateAttendanceRule(
  id: number,
  payload: any,
): Promise<AttendanceRuleResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<AttendanceRuleResource>(data);
}

export async function deleteAttendanceRule(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export interface AttendanceCodeItem {
  code: string;
  description: string | null;
}

export async function getAttendanceRuleCodes(): Promise<AttendanceCodeItem[]> {
  const { data } = await api.get<any>(`${ENDPOINT}/codes`);
  const inner = unwrap<any>(data);
  return Array.isArray(inner) ? inner : (inner?.data ?? []);
}
