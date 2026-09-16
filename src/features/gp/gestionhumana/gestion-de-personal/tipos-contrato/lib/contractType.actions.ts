import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getContractTypesProps,
  ContractTypeResource,
  ContractTypeResponse,
} from "./contractType.interface.ts";
import { CONTRACT_TYPE } from "./contractType.constant.ts";

const { ENDPOINT } = CONTRACT_TYPE;

export async function getContractTypes({
  params,
}: getContractTypesProps): Promise<ContractTypeResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ContractTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllContractTypes({
  params,
}: getContractTypesProps = {}): Promise<ContractTypeResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<ContractTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findContractTypeById(
  id: string,
): Promise<ContractTypeResource> {
  const { data } = await api.get<ContractTypeResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeContractType(
  payload: any,
): Promise<{ data: ContractTypeResource }> {
  const { data } = await api.post<{ data: ContractTypeResource }>(
    ENDPOINT,
    payload,
  );
  return data;
}

export async function updateContractType(
  id: string,
  payload: any,
): Promise<{ data: ContractTypeResource }> {
  const { data } = await api.put<{ data: ContractTypeResource }>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteContractType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
