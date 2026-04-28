import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { format } from "date-fns";
import {
  CustomerKycDeclarationRequest,
  CustomerKycDeclarationResource,
  CustomerKycDeclarationResponse,
  LegalReviewConfirmRequest,
  LegalReviewRejectRequest,
  getCustomerKycDeclarationProps,
} from "./declaracionJuradaKyc.interface";
import { DECLARACION_JURADA_KYC } from "./declaracionJuradaKyc.constants";

const { ENDPOINT } = DECLARACION_JURADA_KYC;

function formatDateField(val: unknown): string | unknown {
  if (val instanceof Date) return format(val, "yyyy-MM-dd");
  return val;
}

function prepareDates(data: CustomerKycDeclarationRequest) {
  return {
    ...data,
    declaration_date: formatDateField(data.declaration_date),
  };
}

export async function getCustomerKycDeclarations({
  params,
}: getCustomerKycDeclarationProps): Promise<CustomerKycDeclarationResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<CustomerKycDeclarationResponse>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function findCustomerKycDeclarationById(
  id: number,
): Promise<CustomerKycDeclarationResource> {
  const response = await api.get<CustomerKycDeclarationResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeCustomerKycDeclaration(
  data: CustomerKycDeclarationRequest,
): Promise<CustomerKycDeclarationResource> {
  const response = await api.post<CustomerKycDeclarationResource>(
    ENDPOINT,
    prepareDates(data),
  );
  return response.data;
}

export async function updateCustomerKycDeclaration(
  id: number,
  data: Partial<CustomerKycDeclarationRequest>,
): Promise<CustomerKycDeclarationResource> {
  const response = await api.put<CustomerKycDeclarationResource>(
    `${ENDPOINT}/${id}`,
    prepareDates(data as CustomerKycDeclarationRequest),
  );
  return response.data;
}

export async function deleteCustomerKycDeclaration(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function downloadCustomerKycDeclarationPdf(
  id: number,
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `declaracion-jurada-kyc-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function uploadSignedKycDeclaration(
  id: number,
  file: File,
): Promise<CustomerKycDeclarationResource> {
  const formData = new FormData();
  formData.append("signed_file", file);
  const response = await api.post<CustomerKycDeclarationResource>(
    `${ENDPOINT}/${id}/upload-signed`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function confirmLegalReview(
  id: number,
  body?: LegalReviewConfirmRequest,
): Promise<CustomerKycDeclarationResource> {
  const response = await api.post<CustomerKycDeclarationResource>(
    `${ENDPOINT}/${id}/confirm-legal-review`,
    body,
  );
  return response.data;
}

export async function rejectLegalReview(
  id: number,
  body: LegalReviewRejectRequest,
): Promise<CustomerKycDeclarationResource> {
  const response = await api.post<CustomerKycDeclarationResource>(
    `${ENDPOINT}/${id}/reject-legal-review`,
    body,
  );
  return response.data;
}
