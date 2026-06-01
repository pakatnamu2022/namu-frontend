import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  LiquidacionBbssResource,
  LiquidacionBbssResponse,
} from "./liquidacion-bbss.interface";
import { LIQUIDACION_BBSS } from "./liquidacion-bbss.constant";

const { ENDPOINT } = LIQUIDACION_BBSS;

function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getLiquidacionesBbss(
  params?: Record<string, any>,
): Promise<LiquidacionBbssResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<LiquidacionBbssResponse>(ENDPOINT, config);
  return data;
}

export async function findLiquidacionBbssById(
  id: number,
): Promise<LiquidacionBbssResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<LiquidacionBbssResource>(data);
}

export async function storeLiquidacionBbss(
  payload: any,
): Promise<LiquidacionBbssResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<LiquidacionBbssResource>(data);
}

export async function updateLiquidacionBbss(
  id: number,
  payload: any,
): Promise<LiquidacionBbssResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<LiquidacionBbssResource>(data);
}

export async function deleteLiquidacionBbss(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
