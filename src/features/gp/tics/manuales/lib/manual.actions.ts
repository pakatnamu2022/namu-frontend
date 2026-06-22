import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  ManualResource,
  ManualResponse,
  getManualsAdminProps,
} from "./manual.interface";
import { MANUAL } from "./manual.constants";

const { ENDPOINT } = MANUAL;

export async function getManualsAdmin({
  params,
}: getManualsAdminProps): Promise<ManualResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ManualResponse>(ENDPOINT, config);
  return data;
}

export async function findManualById(id: number): Promise<ManualResource> {
  const { data } = await api.get<ManualResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeManual(payload: {
  vista_id: number;
  title: string;
  description?: string;
  order?: number;
  file: File;
}): Promise<ManualResource> {
  const formData = new FormData();
  formData.append("vista_id", String(payload.vista_id));
  formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.order !== undefined)
    formData.append("order", String(payload.order));
  formData.append("file", payload.file);

  const { data } = await api.post<ManualResource>(ENDPOINT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateManual(
  id: number,
  payload: {
    vista_id?: number;
    title?: string;
    description?: string;
    order?: number;
    file?: File;
  },
): Promise<ManualResource> {
  if (payload.file) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (payload.vista_id !== undefined)
      formData.append("vista_id", String(payload.vista_id));
    if (payload.title) formData.append("title", payload.title);
    if (payload.description !== undefined)
      formData.append("description", payload.description);
    if (payload.order !== undefined)
      formData.append("order", String(payload.order));
    formData.append("file", payload.file);

    const { data } = await api.post<ManualResource>(
      `${ENDPOINT}/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  }

  const { data } = await api.put<ManualResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteManual(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
