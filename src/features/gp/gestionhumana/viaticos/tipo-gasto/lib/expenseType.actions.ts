import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { EXPENSE_TYPE } from "./expenseType.constants";
import {
  getExpenseTypeProps,
  ExpenseTypeRequest,
  ExpenseTypeResource,
  ExpenseTypeResponse,
} from "./expenseType.interface";

const { ENDPOINT } = EXPENSE_TYPE;
const ENDPOINT_ACTIVE = ENDPOINT + "/active";
export async function getExpenseTypes({
  params,
}: getExpenseTypeProps): Promise<ExpenseTypeResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<ExpenseTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllExpenseTypes({
  params,
}: getExpenseTypeProps = {}): Promise<ExpenseTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ExpenseTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function getActiveExpenseTypes({
  params,
}: getExpenseTypeProps = {}): Promise<ExpenseTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ExpenseTypeResource[]>(
    ENDPOINT_ACTIVE,
    config
  );
  return data;
}

export async function findExpenseTypeById(
  id: number
): Promise<ExpenseTypeResource> {
  const response = await api.get<ExpenseTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeExpenseType(
  data: ExpenseTypeRequest
): Promise<ExpenseTypeResource> {
  const response = await api.post<ExpenseTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateExpenseType(
  id: number,
  data: ExpenseTypeRequest
): Promise<ExpenseTypeResource> {
  const response = await api.put<ExpenseTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteExpenseType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
