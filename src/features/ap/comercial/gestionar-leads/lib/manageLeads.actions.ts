import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { MANAGE_LEADS } from "./manageLeads.constants";
import {
  getManageLeadsProps,
  ManageLeadsResource,
  ManageLeadsResponse,
  ImportLeadsResponse,
  AssignWorkersResponse,
} from "./manageLeads.interface";

const { ENDPOINT } = MANAGE_LEADS;

export async function getManageLeads({
  params,
}: getManageLeadsProps): Promise<ManageLeadsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ManageLeadsResponse>(ENDPOINT, config);
  return data;
}

export async function getMyLeads({
  params,
}: getManageLeadsProps): Promise<ManageLeadsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };

  const { data } = await api.get<ManageLeadsResponse>(
    `${ENDPOINT}/my`,
    config,
  );
  return data;
}

export async function getAllManageLeads({
  params,
}: getManageLeadsProps): Promise<ManageLeadsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<ManageLeadsResource[]>(ENDPOINT, config);
  return data;
}

export async function getManageLead(id: number): Promise<ManageLeadsResource> {
  const { data } = await api.get<ManageLeadsResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeManageLeads(
  data: any,
): Promise<ManageLeadsResource> {
  const response = await api.post<ManageLeadsResource>(ENDPOINT, data);
  return response.data;
}

export async function deleteManageLeads(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function discardLead(
  id: number,
  comment: string,
  reasonDiscardingId: number,
): Promise<GeneralResponse> {
  const { data } = await api.put<GeneralResponse>(`${ENDPOINT}/${id}/discard`, {
    comment,
    reason_discarding_id: reasonDiscardingId,
  });
  return data;
}

export async function importManageLeadsDerco(
  file: File,
): Promise<ImportLeadsResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportLeadsResponse>(
    `${ENDPOINT}/import-derco`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
}

export async function importManageLeadsSocialNetworks(
  file: File,
): Promise<ImportLeadsResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportLeadsResponse>(
    `${ENDPOINT}/import-social-networks`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
}

export async function assignWorkersToLeads(): Promise<AssignWorkersResponse> {
  const { data } = await api.post<AssignWorkersResponse>(
    `${ENDPOINT}/assign-workers`,
  );
  return data;
}

export async function downloadManageLeadsFile({
  params,
}: getManageLeadsProps): Promise<void> {
  if (!params) {
    return;
  }

  const isPDF = params.format === "pdf";

  const config: AxiosRequestConfig = {
    params: {
      type: "LEADS",
      created_at: params.created_at,
      ...(isPDF && { format: "pdf" }),
    },
    responseType: "blob",
  };

  const response = await api.get(`${ENDPOINT}/export`, config);

  // Determinar el tipo MIME y extensión según el formato
  const mimeType = isPDF
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const extension = isPDF ? "pdf" : "xlsx";

  const blob = new Blob([response.data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Generar nombre de archivo con fechas si están disponibles
  const dateRange = params.created_at
    ? `${params.created_at[0]}_${params.created_at[1]}`
    : new Date().toISOString().split("T")[0];

  link.download = `leads-${dateRange}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
