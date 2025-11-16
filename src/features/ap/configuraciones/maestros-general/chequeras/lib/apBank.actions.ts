import type { AxiosRequestConfig } from "axios";
import {
  ApBankResource,
  ApBankResponse,
  getApBankProps,
} from "./apBank.interface";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { BANK_AP } from "./apBank.constants";

const { ENDPOINT } = BANK_AP;

export async function getApBank({
  params,
}: getApBankProps): Promise<ApBankResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ApBankResponse>(ENDPOINT, config);
  return data;
}

export async function getAllApBank({
  params,
}: getApBankProps): Promise<ApBankResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ApBankResource[]>(ENDPOINT, config);
  return data;
}

export async function findApBankById(id: number): Promise<ApBankResource> {
  const response = await api.get<ApBankResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeApBank(data: any): Promise<ApBankResource> {
  const response = await api.post<ApBankResource>(ENDPOINT, data);
  return response.data;
}

export async function updateApBank(
  id: number,
  data: any
): Promise<ApBankResource> {
  const response = await api.put<ApBankResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteApBank(id: number): Promise<ApBankResponse> {
  const { data } = await api.delete<ApBankResponse>(`${ENDPOINT}/${id}`);
  return data;
}
