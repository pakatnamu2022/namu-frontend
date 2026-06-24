import { api } from "@/core/api";
import { ACCOUNTS_RECEIVABLE } from "./accountsReceivable.constants";
import type {
  AccountsReceivableResponse,
  AccountReceivable,
  AccountReceivableComment,
  AccountsReceivableFilters,
  DashboardFilters,
  FilterTreeNode,
  AccountsReceivableDashboardResponse,
} from "./accountsReceivable.interface";

const { ENDPOINT, COMPANY } = ACCOUNTS_RECEIVABLE;

export async function getAccountsReceivable(
  filters: AccountsReceivableFilters,
): Promise<AccountsReceivableResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value;
    } else {
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

export async function addAccountComment(id: number, comment: string): Promise<AccountReceivableComment> {
  const { data } = await api.post<AccountReceivableComment>(`${ENDPOINT}/${id}/comments`, { comment });
  return data;
}

export async function updateAccountComment(commentId: number, comment: string): Promise<void> {
  await api.put(`${ENDPOINT}/comments/${commentId}`, { comment });
}

export async function deleteAccountComment(commentId: number): Promise<void> {
  await api.delete(`${ENDPOINT}/comments/${commentId}`);
}

export async function getFilterTree(): Promise<FilterTreeNode[]> {
  const { data } = await api.get<FilterTreeNode[]>(`${ENDPOINT}/filterTree`);
  return data;
}

export async function sendDueReports(company?: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `${ENDPOINT}/send-due-reports`,
    { company: company ?? COMPANY },
  );
  return data;
}

export async function sendGlobalExcel(company?: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    `${ENDPOINT}/send-global-excel`,
    null,
    { params: { company: company ?? COMPANY } },
  );
  return data;
}

export async function downloadGlobalExcel(company?: string): Promise<void> {
  const { data, headers } = await api.get(`${ENDPOINT}/download-excel`, {
    params: { company: company ?? COMPANY },
    responseType: "blob",
  });
  const contentDisposition = headers["content-disposition"] as string | undefined;
  const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, "") : "cuentas-por-cobrar.xlsx";
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getAccountsReceivableDashboard(
  company: string,
  filters?: DashboardFilters,
): Promise<AccountsReceivableDashboardResponse> {
  const params: Record<string, any> = { company };
  if (filters?.sede_id?.length) params["sede_id"] = filters.sede_id;
  if (filters?.overdue_status?.length) params["overdue_status"] = filters.overdue_status;
  if (filters?.due_year?.length) params["due_year"] = filters.due_year;
  const { data } = await api.get<AccountsReceivableDashboardResponse>(
    `${ENDPOINT}/dashboard`,
    { params },
  );
  return data;
}
