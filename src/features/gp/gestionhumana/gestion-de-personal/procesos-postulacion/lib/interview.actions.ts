import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getInterviewsProps,
  InterviewResource,
  InterviewResponse,
  ProcessCompetence,
} from "./interview.interface.ts";
import { INTERVIEW, PROCESS_COMPETENCE_ENDPOINT } from "./interview.constant.ts";

const { ENDPOINT } = INTERVIEW;

export async function getInterviews({
  params,
}: getInterviewsProps): Promise<InterviewResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<InterviewResponse>(ENDPOINT, config);
  return data;
}

export async function findInterviewById(id: string | number): Promise<InterviewResource> {
  const { data } = await api.get<InterviewResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeInterview(payload: any): Promise<InterviewResource> {
  const { data } = await api.post<InterviewResource>(ENDPOINT, payload);
  return data;
}

export async function updateInterview(
  id: number,
  payload: any,
): Promise<InterviewResource> {
  const { data } = await api.put<InterviewResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function scoreInterview(
  id: number,
  scores: { sub_competencia_id: number; puntaje: number }[],
): Promise<InterviewResource> {
  const { data } = await api.put<InterviewResource>(`${ENDPOINT}/${id}/score`, {
    scores,
  });
  return data;
}

export async function deleteInterview(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getProcessCompetences(
  processId: number,
): Promise<ProcessCompetence[]> {
  const { data } = await api.get<ProcessCompetence[]>(
    PROCESS_COMPETENCE_ENDPOINT(processId),
  );
  return data;
}

export async function syncProcessCompetences(
  processId: number,
  subCompetencias: { id: number; orden?: number }[],
): Promise<ProcessCompetence[]> {
  const { data } = await api.put<ProcessCompetence[]>(
    PROCESS_COMPETENCE_ENDPOINT(processId),
    { sub_competencias: subCompetencias },
  );
  return data;
}
