import { api } from "@/core/api";
import { ACCOUNTS_RECEIVABLE } from "./accountsReceivable.constants";
import type {
  AccountsReceivableResponse,
  AccountReceivable,
  AccountsReceivableFilters,
  FilterTreeNode,
  AccountsReceivableDashboardResponse,
} from "./accountsReceivable.interface";

const { ENDPOINT, COMPANY } = ACCOUNTS_RECEIVABLE;

export async function getAccountsReceivable(
  filters: AccountsReceivableFilters,
): Promise<AccountsReceivableResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params[key] = value;
    }
  });
  const { data } = await api.get<AccountsReceivableResponse>(ENDPOINT, { params });
  return data;
}

export async function getAccountReceivableById(id: number): Promise<AccountReceivable> {
  const { data } = await api.get<AccountReceivable>(`${ENDPOINT}/${id}`);
  return data;
}

export async function syncAccountsReceivable(): Promise<{ message: string; synced: number }> {
  const { data } = await api.post<{ message: string; synced: number }>(`${ENDPOINT}/sync`, { company: COMPANY });
  return data;
}

export async function addAccountComment(id: number, comment: string): Promise<void> {
  await api.post(`${ENDPOINT}/${id}/comments`, { comment });
}

export async function getFilterTree(): Promise<FilterTreeNode[]> {
  const { data } = await api.get<FilterTreeNode[]>(`${ENDPOINT}/filterTree`);
  return data;
}

export async function sendDueReports(company?: string): Promise<{ message: string }> {
  const { data } = await api.post<{ data: { message: string } }>(
    `${ENDPOINT}/send-due-reports`,
    { company: company ?? COMPANY },
  );
  return data.data;
}

export async function getAccountsReceivableDashboard(
  company: string,
): Promise<AccountsReceivableDashboardResponse> {
  const { data } = await api.get<AccountsReceivableDashboardResponse>(
    `${ENDPOINT}/dashboard`,
    { params: { company } },
  );
  return data;
}
