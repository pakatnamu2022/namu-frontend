import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";
import {
  getCompetencesProps,
  CompetenceResource,
  CompetenceResponse,
} from "./competence.interface";
import { COMPETENCE } from "./competence.constans";

const { ENDPOINT } = COMPETENCE;

export async function getCompetence({
  params,
}: getCompetencesProps): Promise<CompetenceResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<CompetenceResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCompetence(): Promise<CompetenceResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<CompetenceResource[]>(ENDPOINT, config);
  return data;
}

export async function findCompetenceById(
  id: string
): Promise<CompetenceResource> {
  const response = await api.get<CompetenceResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeCompetence(data: any): Promise<CompetenceResponse> {
  const response = await api.post<CompetenceResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateCompetence(
  id: string,
  data: any
): Promise<CompetenceResponse> {
  const response = await api.put<CompetenceResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteCompetence(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
