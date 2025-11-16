"use server";

import { api } from "@/core/api";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AGENDA } from "./agenda.constants";
import {
  AgendaResponse,
  AgendaResource,
  AgendaRequest,
  getAgendaProps,
} from "./agenda.interface";

export async function getAgenda({
  params,
}: getAgendaProps = {}): Promise<AgendaResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<AgendaResponse>(AGENDA.ENDPOINT, config);
  return data;
}

export async function getAgendaById(id: number): Promise<AgendaResource> {
  const { data } = await api.get<AgendaResource>(`${AGENDA.ENDPOINT}/${id}`);
  return data;
}

export async function storeAgenda(
  data: AgendaRequest
): Promise<AgendaResource> {
  const response = await api.post<AgendaResource>(AGENDA.ENDPOINT, data);
  return response.data;
}

export async function updateAgenda(
  id: number,
  data: AgendaRequest
): Promise<AgendaResource> {
  const response = await api.put<AgendaResource>(
    `${AGENDA.ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteAgenda(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `${AGENDA.ENDPOINT}/${id}`
  );
  return data;
}
