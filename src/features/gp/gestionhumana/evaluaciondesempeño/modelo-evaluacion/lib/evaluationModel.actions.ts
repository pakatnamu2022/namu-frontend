import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getEvaluationModelsProps,
  EvaluationModelResource,
  EvaluationModelResponse,
  EvaluationModelRequest,
} from "./evaluationModel.interface";
import { EVALUATION_MODEL } from "./evaluationModel.constants";

const { ENDPOINT } = EVALUATION_MODEL;

export async function getEvaluationModels({
  params,
}: getEvaluationModelsProps): Promise<EvaluationModelResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EvaluationModelResponse>(ENDPOINT, config);
  return data;
}

export async function getAllEvaluationModels(): Promise<
  EvaluationModelResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<EvaluationModelResource[]>(ENDPOINT, config);
  return data;
}

export async function findEvaluationModelById(
  id: number
): Promise<EvaluationModelResource> {
  const response = await api.get<EvaluationModelResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeEvaluationModel(
  data: EvaluationModelRequest
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateEvaluationModel(
  id: string,
  data: EvaluationModelRequest
): Promise<GeneralResponse> {
  const response = await api.put<GeneralResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteEvaluationModel(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
