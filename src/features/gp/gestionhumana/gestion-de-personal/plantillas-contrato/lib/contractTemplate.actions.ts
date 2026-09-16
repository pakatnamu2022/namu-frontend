import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getContractTemplatesProps,
  ContractTemplateResource,
  ContractTemplateResponse,
} from "./contractTemplate.interface.ts";
import { CONTRACT_TEMPLATE } from "./contractTemplate.constant.ts";

const { ENDPOINT } = CONTRACT_TEMPLATE;

export async function getContractTemplates({
  params,
}: getContractTemplatesProps): Promise<ContractTemplateResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ContractTemplateResponse>(ENDPOINT, config);
  return data;
}

export async function getAllContractTemplates({
  params,
}: getContractTemplatesProps = {}): Promise<ContractTemplateResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<ContractTemplateResource[]>(ENDPOINT, config);
  return data;
}

export async function findContractTemplateById(
  id: string,
): Promise<ContractTemplateResource> {
  const { data } = await api.get<ContractTemplateResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeContractTemplate(
  payload: any,
): Promise<{ data: ContractTemplateResource }> {
  const { data } = await api.post<{ data: ContractTemplateResource }>(
    ENDPOINT,
    payload,
  );
  return data;
}

export async function updateContractTemplate(
  id: string,
  payload: any,
): Promise<{ data: ContractTemplateResource }> {
  const { data } = await api.put<{ data: ContractTemplateResource }>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteContractTemplate(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
