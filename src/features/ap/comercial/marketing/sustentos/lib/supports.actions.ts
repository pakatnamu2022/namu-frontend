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
  payload: SupportsSchema,
): Promise<SupportsResource> {
  const { data } = await api.post<SupportsResource>(ENDPOINT, payload);
  return data;
}

export async function deleteSupports(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
