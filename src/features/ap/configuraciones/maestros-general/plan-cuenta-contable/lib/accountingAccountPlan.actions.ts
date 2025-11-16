import { AxiosRequestConfig } from "axios";
import {
  AccountingAccountPlanResource,
  AccountingAccountPlanResponse,
  getAccountingAccountPlanProps,
} from "./accountingAccountPlan.interface";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ACCOUNTING_ACCOUNT_PLAN } from "./accountingAccountPlan.constants";

const { ENDPOINT } = ACCOUNTING_ACCOUNT_PLAN;

export async function getAccountingAccountPlan({
  params,
}: getAccountingAccountPlanProps): Promise<AccountingAccountPlanResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AccountingAccountPlanResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllAccountingAccountPlan({
  params,
}: getAccountingAccountPlanProps): Promise<AccountingAccountPlanResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<AccountingAccountPlanResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findAccountingAccountPlanById(
  id: number
): Promise<AccountingAccountPlanResource> {
  const response = await api.get<AccountingAccountPlanResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAccountingAccountPlan(
  data: any
): Promise<AccountingAccountPlanResource> {
  const response = await api.post<AccountingAccountPlanResource>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateAccountingAccountPlan(
  id: number,
  data: any
): Promise<AccountingAccountPlanResource> {
  const response = await api.put<AccountingAccountPlanResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteAccountingAccountPlan(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
