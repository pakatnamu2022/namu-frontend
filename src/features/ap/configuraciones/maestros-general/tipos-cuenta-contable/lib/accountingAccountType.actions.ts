import type { AxiosRequestConfig } from "axios";
import {
  AccountingAccountTypeResource,
  AccountingAccountTypeResponse,
  getAccountingAccountTypeProps,
} from "./accountingAccountType.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ACCOUNTING_ACCOUNT_TYPE } from "./accountingAccountType.constants";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = ACCOUNTING_ACCOUNT_TYPE;

export async function getAccountingAccountType({
  params,
}: getAccountingAccountTypeProps): Promise<AccountingAccountTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.ACCOUNTING_ACCOUNT_TYPE,
    },
  };
  const { data } = await api.get<AccountingAccountTypeResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllAccountingAccountType({
  params,
}: getAccountingAccountTypeProps): Promise<AccountingAccountTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.ACCOUNTING_ACCOUNT_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<AccountingAccountTypeResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findAccountingAccountTypeById(
  id: number
): Promise<AccountingAccountTypeResource> {
  const response = await api.get<AccountingAccountTypeResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAccountingAccountType(
  data: any
): Promise<AccountingAccountTypeResource> {
  const response = await api.post<AccountingAccountTypeResource>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateAccountingAccountType(
  id: number,
  data: any
): Promise<AccountingAccountTypeResource> {
  const response = await api.put<AccountingAccountTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteAccountingAccountType(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
