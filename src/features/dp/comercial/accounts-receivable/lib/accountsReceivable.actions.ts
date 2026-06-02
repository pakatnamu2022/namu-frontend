import { api } from "@/core/api";
import { ACCOUNTS_RECEIVABLE } from "./accountsReceivable.constants";
import type {
  AccountsReceivableResponse,
  AccountReceivable,
  AccountsReceivableFilters,
  FilterTreeNode,
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

export async function syncAccountsReceivable(): Promise<void> {
  await api.post(`${ENDPOINT}/sync`, { company: COMPANY });
}

export async function addAccountComment(id: number, comment: string): Promise<void> {
  await api.post(`${ENDPOINT}/${id}/comments`, { comment });
}

export async function getFilterTree(): Promise<FilterTreeNode[]> {
  const { data } = await api.get<FilterTreeNode[]>(`${ENDPOINT}/filterTree`);
  return data;
}
