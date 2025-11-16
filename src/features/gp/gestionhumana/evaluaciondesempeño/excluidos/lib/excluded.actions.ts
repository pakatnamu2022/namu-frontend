import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";
import {
  getEvaluationPersonDetailsProps,
  EvaluationPersonDetailResource,
  EvaluationPersonDetailResponse,
} from "./excluded.interface";
import { api } from "@/src/core/api";
import { EXCLUDED } from "./excluded.constants";

const { ENDPOINT } = EXCLUDED;

export async function getEvaluationPersonDetail({
  params,
}: getEvaluationPersonDetailsProps): Promise<EvaluationPersonDetailResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<EvaluationPersonDetailResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllEvaluationPersonDetails(): Promise<
  EvaluationPersonDetailResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<EvaluationPersonDetailResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function storeEvaluationPersonDetail(
  data: any
): Promise<EvaluationPersonDetailResponse> {
  const response = await api.post<EvaluationPersonDetailResponse>(
    `${ENDPOINT}`,
    data
  );
  return response.data;
}

export async function deleteEvaluationPersonDetail(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
