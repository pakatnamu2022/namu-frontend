import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getRecruitmentProcessesProps,
  RecruitmentProcessCoverage,
  RecruitmentProcessHistoryEntry,
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
  const { data } = await api.get<RecruitmentProcessResource>(
    `${ENDPOINT}/${id}`,
  );
  return data;
}

export async function storeRecruitmentProcess(
  payload: any,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.post<RecruitmentProcessResource>(ENDPOINT, payload);
  return data;
}

export async function updateRecruitmentProcess(
  id: string,
  payload: any,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.put<RecruitmentProcessResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function closeRecruitmentProcess(
  id: number,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.post<RecruitmentProcessResource>(
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

export async function pauseRecruitmentProcess(
  id: number,
  motivo: string,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.post<RecruitmentProcessResource>(
    `${ENDPOINT}/${id}/pause`,
    { motivo },
  );
  return data;
}

export async function resumeRecruitmentProcess(
  id: number,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.post<RecruitmentProcessResource>(
    `${ENDPOINT}/${id}/resume`,
  );
  return data;
}

export async function reopenRecruitmentProcess(
  id: number,
): Promise<RecruitmentProcessResource> {
  const { data } = await api.post<RecruitmentProcessResource>(
    `${ENDPOINT}/${id}/reopen`,
  );
  return data;
}

export async function addDaysToRecruitmentProcesses(payload: {
  proceso_postulacion_ids: number[];
  dias: number;
  motivo: string;
}): Promise<RecruitmentProcessResource[]> {
  const { data } = await api.post<RecruitmentProcessResource[]>(
    `${ENDPOINT}/add-days`,
    payload,
  );
  return data;
}

export async function getRecruitmentProcessCoverage(
  id: number,
): Promise<RecruitmentProcessCoverage> {
  const { data } = await api.get<RecruitmentProcessCoverage>(
    `${ENDPOINT}/${id}/coverage`,
  );
  return data;
}

export async function getRecruitmentProcessHistory(
  id: number,
): Promise<RecruitmentProcessHistoryEntry[]> {
  const { data } = await api.get<RecruitmentProcessHistoryEntry[]>(
    `${ENDPOINT}/${id}/history`,
  );
  return data;
}
