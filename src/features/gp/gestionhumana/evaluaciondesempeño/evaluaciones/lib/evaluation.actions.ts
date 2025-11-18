import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getEvaluationsProps,
  EvaluationResource,
  EvaluationResponse,
} from "./evaluation.interface";
import { EVALUATION } from "./evaluation.constans";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { PositionResource } from "../../../personal/posiciones/lib/position.interface";
import { HierarchicalCategoryResource } from "../../categorias-jerarquicas/lib/hierarchicalCategory.interface";

const { ENDPOINT } = EVALUATION;

export async function getEvaluation({
  params,
}: getEvaluationsProps): Promise<EvaluationResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EvaluationResponse>(ENDPOINT, config);
  return data;
}

export async function getActiveEvaluation(): Promise<EvaluationResource> {
  const { data } = await api.get<EvaluationResource>(`${ENDPOINT}/active`);
  return data;
}

export async function getAllEvaluations(): Promise<EvaluationResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all Evaluations
    },
  };
  const { data } = await api.get<EvaluationResource[]>(ENDPOINT, config);
  return data;
}

export async function findEvaluationById(
  id: string
): Promise<EvaluationResource> {
  const response = await api.get<EvaluationResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeEvaluation(data: any): Promise<EvaluationResponse> {
  const response = await api.post<EvaluationResponse>(`${ENDPOINT}`, data);
  return response.data;
}

export async function updateEvaluation(
  id: number,
  data: any
): Promise<EvaluationResponse> {
  const response = await api.put<EvaluationResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteEvaluation(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getPersonsInEvaluation(
  id: string
): Promise<WorkerResource[]> {
  const { data } = await api.get<WorkerResource[]>(
    `${ENDPOINT}/${id}/participants`
  );
  return data;
}

export async function getPositionsInEvaluation(
  id: string
): Promise<PositionResource[]> {
  const { data } = await api.get<PositionResource[]>(
    `${ENDPOINT}/${id}/positions`
  );
  return data;
}

export async function getCategoriesInEvaluation(
  id: string
): Promise<HierarchicalCategoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: "true",
    },
  };
  const { data } = await api.get<HierarchicalCategoryResource[]>(
    `${ENDPOINT}/${id}/categories`,
    config
  );
  return data;
}

export async function checkEvaluationDates(
  start_date: string,
  end_date: string
): Promise<{ isValid: boolean; message?: string }> {
  const config: AxiosRequestConfig = {
    params: {
      start_date,
      end_date,
    },
  };
  const { data } = await api.get<{ isValid: boolean; message?: string }>(
    `${ENDPOINT}/check`,
    config
  );
  return data;
}

interface RegenerateEvaluationParams {
  mode: 'full_reset' | 'sync_with_cycle' | 'add_missing_only';
  reset_progress?: boolean;
  force?: boolean;
}

export async function regenerateEvaluation(
  id: number,
  params: RegenerateEvaluationParams = { mode: "add_missing_only" }
): Promise<{ message?: string }> {
  const { data } = await api.post<{ message?: string }>(
    `${ENDPOINT}/${id}/regenerateEvaluation`,
    params
  );
  return data;
}

interface NotificationResponse {
  success: boolean;
  message: string;
}

export async function sendEvaluationOpened(
  id: number
): Promise<NotificationResponse> {
  const { data } = await api.post<NotificationResponse>(
    `${ENDPOINT}/${id}/notifications/send-opened`
  );
  return data;
}

export async function sendEvaluationReminder(
  id: number
): Promise<NotificationResponse> {
  const { data } = await api.post<NotificationResponse>(
    `${ENDPOINT}/${id}/notifications/send-reminder`
  );
  return data;
}

export async function sendEvaluationClosed(
  id: number
): Promise<NotificationResponse> {
  const { data } = await api.post<NotificationResponse>(
    `${ENDPOINT}/${id}/notifications/send-closed`
  );
  return data;
}
