import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  SctrRateRequest,
  SctrRateResource,
  SctrRateResponse,
} from "./sctr-rate.interface";
import { SCTR_RATE } from "./sctr-rate.constants";

const { ENDPOINT } = SCTR_RATE;

export async function getSctrRates(
  params?: Record<string, any>,
): Promise<SctrRateResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<SctrRateResponse>(ENDPOINT, config);
  return data;
}

export async function storeSctrRate(
  payload: SctrRateRequest,
): Promise<SctrRateResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return data?.data ?? data;
}
