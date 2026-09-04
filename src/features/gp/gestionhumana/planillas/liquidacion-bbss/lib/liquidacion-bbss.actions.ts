import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  LiquidacionBbssResource,
  LiquidacionBbssResponse,
  LiquidacionBbssPivotResponse,
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

export async function getLiquidacionesBbssPivot(
  params: Record<string, any>,
): Promise<LiquidacionBbssPivotResponse> {
  // No usar unwrap() aquí: este endpoint ya responde {data, columns} tal cual (no envuelve un
  // recurso individual dentro de "data" como el resto de endpoints CRUD), así que unwrap()
  // colapsaría la respuesta al array de filas y perdería "columns".
  const { data } = await api.get<LiquidacionBbssPivotResponse>(
    `${ENDPOINT}/pivot`,
    { params },
  );
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

export interface CalculateGratificationResult {
  success: boolean;
  period_id: number;
  workers_processed: number;
  skipped: string[];
}

export async function calculateGratification(
  periodId: number | string,
): Promise<CalculateGratificationResult> {
  const { data } = await api.post<any>(
    `${ENDPOINT}/calculate-gratification/${periodId}`,
  );
  return unwrap<CalculateGratificationResult>(data);
}

export interface CalculateCtsResult {
  success: boolean;
  period_id: number;
  reference_period_id: number;
  workers_processed: number;
  skipped: string[];
}

export async function calculateCts(
  periodId: number | string,
): Promise<CalculateCtsResult> {
  const { data } = await api.post<any>(
    `${ENDPOINT}/calculate-cts/${periodId}`,
  );
  return unwrap<CalculateCtsResult>(data);
}

export interface GratificationStatus {
  ready: boolean;
  reference_period: { id: number; code: string; name: string } | null;
  message: string | null;
}

export async function getGratificationStatus(
  periodId: number | string,
): Promise<GratificationStatus> {
  const { data } = await api.get<any>(
    `${ENDPOINT}/gratification-status/${periodId}`,
  );
  return unwrap<GratificationStatus>(data);
}

export async function downloadLiquidationBbssPayslip(
  periodId: number | string,
  workerId: number | string,
  type: "cts" | "gratificacion",
): Promise<Blob> {
  const { data } = await api.get<Blob>(
    `${ENDPOINT}/payslip/${periodId}/${workerId}`,
    { params: { type }, responseType: "blob" },
  );
  return data;
}
