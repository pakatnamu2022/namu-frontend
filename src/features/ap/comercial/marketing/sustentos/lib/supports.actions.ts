import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { SUPPORTS } from "./supports.constants";
import {
  SupportsResource,
  SupportsResponse,
  getSupportsProps,
} from "./supports.interface";
import { SupportsSchema } from "./supports.schema";

const { ENDPOINT } = SUPPORTS;

export async function getSupports({
  params,
}: getSupportsProps): Promise<SupportsResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<SupportsResponse>(ENDPOINT, config);
  return data;
}

export async function findSupportsById(id: number): Promise<SupportsResource> {
  const { data } = await api.get<SupportsResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeSupports(
  payload: SupportsSchema & { file?: File | null },
): Promise<SupportsResource> {
  const { file, ...rest } = payload;

  if (file) {
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    formData.append("file", file);
    const { data } = await api.post<SupportsResource>(ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await api.post<SupportsResource>(ENDPOINT, rest);
  return data;
}

export async function updateSupports(
  id: number,
  payload: Partial<SupportsSchema> & { file?: File | null },
): Promise<SupportsResource> {
  const { file, ...rest } = payload;

  if (file) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    formData.append("file", file);
    const { data } = await api.post<SupportsResource>(`${ENDPOINT}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await api.put<SupportsResource>(`${ENDPOINT}/${id}`, rest);
  return data;
}

export async function deleteSupports(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
