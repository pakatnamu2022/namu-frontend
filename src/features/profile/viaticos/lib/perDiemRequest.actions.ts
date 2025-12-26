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

export async function downloadSettlementPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/settlement-pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `liquidacion-viaticos-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function confirmPerDiemRequest(
  id: number
): Promise<PerDiemRequestResource> {
  const response = await api.post<PerDiemRequestResource>(
    `${ENDPOINT}/${id}/confirm`
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
  expenseId: number
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `gp/gestion-humana/viaticos/per-diem-expenses/${expenseId}/reject`
  );
  return data;
}
