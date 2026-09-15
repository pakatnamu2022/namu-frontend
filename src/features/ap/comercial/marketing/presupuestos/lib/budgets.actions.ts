import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { BUDGETS } from "./budgets.constants";
import { BudgetsResource, BudgetsResponse, getBudgetsProps } from "./budgets.interface";
import { BudgetsSchema } from "./budgets.schema";

const { ENDPOINT } = BUDGETS;

export async function getBudgets({
  params,
}: getBudgetsProps): Promise<BudgetsResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<BudgetsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBudgets({
  params,
}: getBudgetsProps = {}): Promise<BudgetsResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<BudgetsResource[]>(ENDPOINT, config);
  return data;
}

export async function findBudgetsById(id: number): Promise<BudgetsResource> {
  const { data } = await api.get<BudgetsResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeBudgets(
  payload: BudgetsSchema,
): Promise<BudgetsResource> {
  const { data } = await api.post<BudgetsResource>(ENDPOINT, payload);
  return data;
}

export async function updateBudgets(
  id: number,
  payload: Partial<BudgetsSchema>,
): Promise<BudgetsResource> {
  const { data } = await api.put<BudgetsResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteBudgets(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
