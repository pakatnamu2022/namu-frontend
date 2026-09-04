import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getRecruitmentProcessesProps,
  RecruitmentProcessResource,
  RecruitmentProcessResponse,
} from "./recruitmentProcess.interface.ts";
import { RECRUITMENT_PROCESS } from "./recruitmentProcess.constant.ts";

const { ENDPOINT } = RECRUITMENT_PROCESS;

export async function getRecruitmentProcesses({
  params,
}: getRecruitmentProcessesProps): Promise<RecruitmentProcessResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<RecruitmentProcessResponse>(ENDPOINT, config);
  return data;
}

export async function getAllRecruitmentProcesses({
  params,
}: getRecruitmentProcessesProps): Promise<RecruitmentProcessResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<RecruitmentProcessResource[]>(ENDPOINT, config);
  return data;
}

export async function findRecruitmentProcessById(
  id: string,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.get<{ data: RecruitmentProcessResource }>(
    `${ENDPOINT}/${id}`,
  );
  return data.data;
}

export async function storeRecruitmentProcess(
  payload: any,
): Promise<{ data: RecruitmentProcessResource }> {
  const { data } = await api.post<{ data: RecruitmentProcessResource }>(
    ENDPOINT,
    payload,
  );
  return data;
}

export async function updateRecruitmentProcess(
  id: string,
  payload: any,
): Promise<{ data: RecruitmentProcessResource }> {
  const { data } = await api.put<{ data: RecruitmentProcessResource }>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function closeRecruitmentProcess(
  id: number,
): Promise<{ data: RecruitmentProcessResource }> {
  const { data } = await api.post<{ data: RecruitmentProcessResource }>(
    `${ENDPOINT}/${id}/close`,
  );
  return data;
}

export async function deleteRecruitmentProcess(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
