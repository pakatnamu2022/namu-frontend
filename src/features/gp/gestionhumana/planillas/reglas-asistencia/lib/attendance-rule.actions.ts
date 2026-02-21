import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  AttendanceRuleResource,
  AttendanceRuleResponse,
} from "./attendance-rule.interface";
import { ATTENDANCE_RULE } from "./attendance-rule.constant";

const { ENDPOINT } = ATTENDANCE_RULE;

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
  const response = await api.get<AttendanceRuleResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeAttendanceRule(
  data: any,
): Promise<AttendanceRuleResource> {
  const response = await api.post<AttendanceRuleResource>(ENDPOINT, data);
  return response.data;
}

export async function updateAttendanceRule(
  id: number,
  data: any,
): Promise<AttendanceRuleResource> {
  const response = await api.put<AttendanceRuleResource>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteAttendanceRule(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getAttendanceRuleCodes(): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>(`${ENDPOINT}/codes`);
  return data.data;
}
