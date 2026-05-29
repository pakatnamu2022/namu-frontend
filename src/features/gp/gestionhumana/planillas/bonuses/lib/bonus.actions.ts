import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { BonusResource, BonusResponse } from "./bonus.interface";
import { BONUS } from "./bonus.constant";

const { ENDPOINT } = BONUS;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getBonuses(
  params?: Record<string, any>,
): Promise<BonusResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<BonusResponse>(ENDPOINT, config);
  return data;
}

export async function findBonusById(id: number): Promise<BonusResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<BonusResource>(data);
}

export async function storeBonus(payload: any): Promise<BonusResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<BonusResource>(data);
}

export async function updateBonus(
  id: number,
  payload: any,
): Promise<BonusResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<BonusResource>(data);
}

export async function deleteBonus(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
