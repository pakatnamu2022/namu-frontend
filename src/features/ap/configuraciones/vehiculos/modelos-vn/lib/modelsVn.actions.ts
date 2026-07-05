import type { AxiosRequestConfig } from "axios";
import {
  getModelsVnProps,
  ImportModelsVnResponse,
  ModelVnSyncAllResponse,
  ModelVnSyncLogsResponse,
  ModelVnSyncResponse,
  ModelsVnResource,
  ModelsVnResponse,
  VerifyModelsVnResponse,
} from "./modelsVn.interface";
import { api } from "@/core/api";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { MODELS_VN } from "./modelsVn.constanst";

const { ENDPOINT } = MODELS_VN;

export async function getModelsVn({
  params,
}: getModelsVnProps): Promise<ModelsVnResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ModelsVnResponse>(ENDPOINT, config);
  return data;
}

export async function getModelsVnSearch({
  params,
}: getModelsVnProps): Promise<ModelsVnResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ModelsVnResponse>(ENDPOINT, config);
  return data.data;
}

export async function getAllModelsVn({
  params,
}: getModelsVnProps): Promise<ModelsVnResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ModelsVnResource[]>(ENDPOINT, config);
  return data;
}

export async function findModelsVnById(id: number): Promise<ModelsVnResource> {
  const response = await api.get<ModelsVnResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeModelsVn(data: any): Promise<ModelsVnResource> {
  const response = await api.post<ModelsVnResource>(ENDPOINT, data);
  return response.data;
}

export async function updateModelsVn(
  id: number,
  data: any
): Promise<ModelsVnResource> {
  const response = await api.put<ModelsVnResource>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteModelsVn(id: number): Promise<ModelsVnResponse> {
  const { data } = await api.delete<ModelsVnResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function downloadTemplateModelsVn(): Promise<void> {
  const response = await api.get(`${ENDPOINT}/template`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelos_vn_template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importModelsVn(
  file: File
): Promise<ImportModelsVnResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportModelsVnResponse>(
    `${ENDPOINT}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function downloadVerifyTemplateModelsVn(): Promise<void> {
  const response = await api.get(`${ENDPOINT}/verify/template`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelos_vn_verificacion_template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function verifyModelsVn(
  file: File
): Promise<VerifyModelsVnResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<VerifyModelsVnResponse>(
    `${ENDPOINT}/verify`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function getModelVnSyncLogs(
  params?: Record<string, any>
): Promise<ModelVnSyncLogsResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<ModelVnSyncLogsResponse>(
    `${ENDPOINT}/sync-logs`,
    config
  );
  return data;
}

export async function syncModelVn(id: number): Promise<ModelVnSyncResponse> {
  const { data } = await api.post<ModelVnSyncResponse>(`${ENDPOINT}/${id}/sync`);
  return data;
}

export async function syncAllModelsVn(): Promise<ModelVnSyncAllResponse> {
  const { data } = await api.post<ModelVnSyncAllResponse>(`${ENDPOINT}/sync-all`);
  return data;
}

export async function exportModelsVn(
  params: Record<string, any> = {}
): Promise<void> {
  const isPDF = params.format === "pdf";

  const config: AxiosRequestConfig = {
    params: {
      ...params,
      ...(isPDF && { format: "pdf" }),
    },
    responseType: "blob",
  };

  const response = await api.get(`${ENDPOINT}/export`, config);

  const mimeType = isPDF
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const extension = isPDF ? "pdf" : "xlsx";

  const blob = new Blob([response.data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `modelos_vn.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function getModelVnDynamicsPayload(
  id: number
): Promise<Record<string, any>> {
  const { data } = await api.get<Record<string, any>>(`${ENDPOINT}/${id}/dynamics`);
  return data;
}
