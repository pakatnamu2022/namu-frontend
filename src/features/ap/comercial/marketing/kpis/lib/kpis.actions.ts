import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { KPIS } from "./kpis.constants";
import { KpisResource, KpisResponse, getKpisProps } from "./kpis.interface";
import { KpisSchema } from "./kpis.schema";

const { ENDPOINT } = KPIS;

export async function getKpis({
  params,
}: getKpisProps): Promise<KpisResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<KpisResponse>(ENDPOINT, config);
  return data;
}

export async function getAllKpis({
  params,
}: getKpisProps = {}): Promise<KpisResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<KpisResource[]>(ENDPOINT, config);
  return data;
}

export async function findKpisById(id: number): Promise<KpisResource> {
  const { data } = await api.get<KpisResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeKpis(payload: KpisSchema): Promise<KpisResource> {
  const { data } = await api.post<KpisResource>(ENDPOINT, payload);
  return data;
}

export async function updateKpis(
  id: number,
  payload: Partial<KpisSchema>,
): Promise<KpisResource> {
  const { data } = await api.put<KpisResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteKpis(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
