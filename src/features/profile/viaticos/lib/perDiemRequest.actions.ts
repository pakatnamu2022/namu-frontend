import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PER_DIEM_REQUEST } from "./perDiemRequest.constants";
import {
  getPerDiemRequestProps,
  PerDiemRequestRequest,
  PerDiemRequestResource,
  PerDiemRequestResponse,
  ReviewPerDiemRequestRequest,
} from "./perDiemRequest.interface";

const { ENDPOINT } = PER_DIEM_REQUEST;

export async function getPerDiemRequest({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemRequestResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPerDiemRequest({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<PerDiemRequestResource[]>(ENDPOINT, config);
  return data;
}

export async function findPerDiemRequestById(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.get<PerDiemRequestResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePerDiemRequest(
  data: PerDiemRequestRequest
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePerDiemRequest(
  id: number,
  data: any
): Promise<PerDiemRequestResource> {
  const response = await api.put<PerDiemRequestResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePerDiemRequest(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getMyPerDiemRequests({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemRequestResponse>(
    `${ENDPOINT}/my-requests`,
    config
  );
  return data;
}

export async function storeExpense(
  requestId: number,
  expenseData: FormData
): Promise<any> {
  const response = await api.post(
    `${ENDPOINT}/${requestId}/expenses`,
    expenseData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function updateExpense(
  expenseId: number,
  expenseData: FormData
): Promise<any> {
  const response = await api.post(
    `gp/gestion-humana/viaticos/per-diem-expenses/${expenseId}`,
    expenseData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function deleteExpense(
  requestId: number,
  expenseId: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `${ENDPOINT}/${requestId}/expenses/${expenseId}`
  );
  return data;
}

export async function getPendingApprovals({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemRequestResponse>(
    `${ENDPOINT}/pending-approvals`,
    config
  );
  return data;
}

export async function reviewPerDiemRequest(
  id: number,
  reviewData: ReviewPerDiemRequestRequest
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/review`,
    reviewData
  );
  return response.data;
}

export async function downloadExpenseTotalPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/expense-total-pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `detalle-gastos-total-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadContributorExpenseDetailsPdf(
  id: number
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/expense-detail-pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `detalle-gastos-por-colaborador-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function generateMobilityPayrollPdf(id: number): Promise<void> {
  try {
    const response = await api.get(
      `${ENDPOINT}/${id}/generate-mobility-payroll-pdf`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `planilla-movilidad-viaticos-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    // Si el error es un blob, convertirlo a JSON
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const errorData = JSON.parse(text);
      throw { ...error, response: { ...error.response, data: errorData } };
    }
    throw error;
  }
}

export async function expenseTotalWithEvidencePdf(id: number): Promise<void> {
  try {
    const response = await api.get(
      `${ENDPOINT}/${id}/expense-total-with-evidence-pdf`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `gasto-total-con-evidencias-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    // Si el error es un blob, convertirlo a JSON
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const errorData = JSON.parse(text);
      throw { ...error, response: { ...error.response, data: errorData } };
    }
    throw error;
  }
}

export async function confirmPerDiemRequest(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/confirm`
  );
  return response.data;
}

export async function confirmProgressPerDiemRequest(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/confirm-progress`
  );
  return response.data;
}

export async function validateExpense(
  expenseId: number
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `gp/gestion-humana/viaticos/per-diem-expenses/${expenseId}/validate`
  );
  return data;
}

export async function rejectExpense(
  expenseId: number,
  rejection_reason: string
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `gp/gestion-humana/viaticos/per-diem-expenses/${expenseId}/reject`,
    { rejection_reason }
  );
  return data;
}

export async function uploadDepositFile(
  id: number,
  file: File
): Promise<PerDiemRequestResource> {
  const formData = new FormData();
  formData.append("voucher", file);

  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/agregar-deposito`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function cancelPerDiemRequest(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/cancel`
  );
  return response.data;
}

export async function startSettlement(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/start-settlement`
  );
  return response.data;
}

export async function approveSettlement(
  id: number,
  comments?: string
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/approve-settlement`,
    { comments }
  );
  return response.data;
}

export async function rejectSettlement(
  id: number,
  rejection_reason: string
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/reject-settlement`,
    { rejection_reason }
  );
  return response.data;
}

export async function getPendingSettlements({
  params,
}: getPerDiemRequestProps): Promise<PerDiemRequestResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemRequestResponse>(
    `${ENDPOINT}/pending-settlements`,
    config
  );
  return data;
}

export async function completeSettlement(
  id: number,
  comments?: string
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/complete-settlement`,
    { comments }
  );
  return response.data;
}

export async function resendPerDiemRequestEmails(
  id: number,
  data: {
    email_type: string;
    send_to_employee: boolean;
    send_to_boss: boolean;
    send_to_accounting: boolean;
  }
): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(
    `${ENDPOINT}/${id}/resend-emails`,
    data
  );
  return response.data;
}
