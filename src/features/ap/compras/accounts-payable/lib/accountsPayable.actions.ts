import { api } from "@/core/api";
import { ACCOUNTS_PAYABLE } from "./accountsPayable.constants";
import type {
  AccountsPayableResponse,
  AccountPayable,
  AccountPayableComment,
  AccountsPayableFilters,
  DashboardFilters,
  AccountsPayableDashboardResponse,
} from "./accountsPayable.interface";

const { ENDPOINT, COMPANY } = ACCOUNTS_PAYABLE;

export async function getAccountsPayable(
  filters: AccountsPayableFilters,
): Promise<AccountsPayableResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value;
    } else {
      params[key] = value;
    }
  });
  const { data } = await api.get<AccountsPayableResponse>(ENDPOINT, {
    params,
  });
  return data;
}

export async function getAccountPayableById(
  id: number,
): Promise<AccountPayable> {
  const { data } = await api.get<AccountPayable>(`${ENDPOINT}/${id}`);
  return data;
}

export async function syncAccountsPayable(
  company?: string,
): Promise<{ message: string; synced: number }> {
  const { data } = await api.post<{ message: string; synced: number }>(
    `${ENDPOINT}/sync`,
    { company: company ?? COMPANY },
  );
  return data;
}

export async function addAccountPayableComment(
  id: number,
  comment: string,
): Promise<AccountPayableComment> {
  const { data } = await api.post<AccountPayableComment>(
    `${ENDPOINT}/${id}/comments`,
    { comment },
  );
  return data;
}

export async function updateAccountPayableComment(
  commentId: number,
  comment: string,
): Promise<void> {
  await api.put(`${ENDPOINT}/comments/${commentId}`, { comment });
}

export async function deleteAccountPayableComment(
  commentId: number,
): Promise<void> {
  await api.delete(`${ENDPOINT}/comments/${commentId}`);
}

export async function getAccountsPayableDashboard(
  company: string,
  filters?: DashboardFilters,
): Promise<AccountsPayableDashboardResponse> {
  const params: Record<string, any> = { company };
  if (filters?.moneda) params["moneda"] = filters.moneda;
  const { data } = await api.get<AccountsPayableDashboardResponse>(
    `${ENDPOINT}/dashboard`,
    { params },
  );
  return data;
}
