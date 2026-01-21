import { api } from "@/core/api";
import { EVALUATION_PERSON } from "./evaluationPerson.constans";
import type {
  EvaluationPersonResponse,
  EvaluationPersonResultByPersonAndEvaluationResponse,
  EvaluationPersonResultResource,
  LeaderStatusEvaluationResponse,
} from "./evaluationPerson.interface";
import type { AxiosRequestConfig } from "axios";
import type { MessageResponse } from "@/core/core.interface";

const { ENDPOINT } = EVALUATION_PERSON;

export async function exportEvaluationReport(
  evaluation_id: number
): Promise<Blob> {
  const { data } = await api.get(`${ENDPOINT}/export`, {
    params: {
      evaluation_id,
    },
    responseType: "blob",
  });
  return data;
}

export async function getEvaluationPersonResult(
  params?: Record<string, any>
): Promise<EvaluationPersonResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EvaluationPersonResponse>(ENDPOINT, config);
  return data as EvaluationPersonResponse;
}

export async function getAllEvaluationPersonResult(
  params?: Record<string, any>
): Promise<EvaluationPersonResultResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<EvaluationPersonResultResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getEvaluationPersonResultByPersonAndEvaluation(
  person_id: number,
  evaluation_id?: number
): Promise<EvaluationPersonResultResource> {
  const { data } =
    await api.get<EvaluationPersonResultByPersonAndEvaluationResponse>(
      `${ENDPOINT}/getByPersonAndEvaluation`,
      {
        params: {
          person_id,
          evaluation_id,
        },
      }
    );
  return data.data;
}

export async function getEvaluationsByPersonToEvaluate(
  chief_id: number,
  params?: Record<string, any>
): Promise<EvaluationPersonResultResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<EvaluationPersonResultResource[]>(
    `${ENDPOINT}/evaluations-to-evaluate/${chief_id}`,
    config
  );
  return data;
}

export async function updateEvaluationPerson(
  id: number,
  body: Partial<any> = {}
): Promise<any> {
  const { data } = await api.put<any>(
    `/gp/gh/performanceEvaluation/evaluationPerson/${id}`,
    body
  );
  return data;
}

export async function updateEvaluationPersonCompetence(
  id: number,
  body: Partial<any> = {}
): Promise<any> {
  const { data } = await api.put<any>(
    `/gp/gh/performanceEvaluation/personCompetenceDetail/${id}`,
    body
  );
  return data;
}

export async function regenerateEvaluationPerson(
  person_id: number,
  evaluation_id: number
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(
    `${ENDPOINT}/regenerate/${person_id}/${evaluation_id}`,
    { evaluation_id }
  );
  return data;
}

export async function getLeadersStatus(
  evaluationId: number
): Promise<LeaderStatusEvaluationResponse> {
  const { data } = await api.get<LeaderStatusEvaluationResponse>(
    `${ENDPOINT}/evaluation/${evaluationId}/leaders-status`
  );
  return data;
}

export async function sendReminderToLeader(
  evaluationId: number,
  leaderId: number
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(
    `/gp/gh/performanceEvaluation/evaluation/notifications/send-reminder-to-leader`,
    {
      evaluation_id: evaluationId,
      leader_id: leaderId,
    }
  );
  return data;
}
