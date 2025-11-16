import { AxiosRequestConfig } from "axios";
import { BankResource, BankResponse, getBankProps } from "./bank.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { BANK } from "./bank.constants";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = BANK;

export async function getBank({ params }: getBankProps): Promise<BankResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.BANK,
    },
  };
  const { data } = await api.get<BankResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBank({
  params,
}: getBankProps): Promise<BankResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.BANK,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<BankResource[]>(ENDPOINT, config);
  return data;
}

export async function findBankById(id: number): Promise<BankResource> {
  const response = await api.get<BankResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBank(data: any): Promise<BankResource> {
  const response = await api.post<BankResource>(ENDPOINT, data);
  return response.data;
}

export async function updateBank(id: number, data: any): Promise<BankResource> {
  const response = await api.put<BankResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBank(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
