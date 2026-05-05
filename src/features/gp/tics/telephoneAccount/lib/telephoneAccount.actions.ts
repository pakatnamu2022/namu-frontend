import { api } from "@/core/api";
import {
  TelephoneAccountResource,
  TelephoneAccountResponse,
  getTelephoneAccountsProps,
} from "./telephoneAccount.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { TELEPHONE_ACCOUNT } from "./telephoneAccount.constants";

const { ENDPOINT } = TELEPHONE_ACCOUNT;

export async function getTelephoneAccounts({
  params,
}: getTelephoneAccountsProps): Promise<TelephoneAccountResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<TelephoneAccountResponse>(ENDPOINT, config);
  return data;
}

export async function findTelephoneAccountById(
  id: string,
): Promise<TelephoneAccountResource> {
  const response = await api.get<TelephoneAccountResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTelephoneAccount(
  data: any,
): Promise<TelephoneAccountResponse> {
  const response = await api.post<TelephoneAccountResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateTelephoneAccount(
  id: string,
  data: any,
): Promise<TelephoneAccountResponse> {
  const response = await api.put<TelephoneAccountResponse>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

export async function deleteTelephoneAccount(
  id: string,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getAllTelephoneAccounts(): Promise<
  TelephoneAccountResource[]
> {
  const config: AxiosRequestConfig = { params: { all: true } };
  const { data } = await api.get<TelephoneAccountResource[]>(ENDPOINT, config);
  return data;
}

export async function getTelephoneOperators(): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>(
    `${ENDPOINT}/operators`,
  );
  return data.data;
}
