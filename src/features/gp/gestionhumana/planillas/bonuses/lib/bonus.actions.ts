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

/**
 * GET /bonuses/template?company_id=
 * Descarga la plantilla Excel (cabecera azul) para completar DNI + monto e importarla luego con
 * importBonuses().
 */
export async function downloadBonusTemplate(
  companyId: string | number,
): Promise<void> {
  const { data } = await api.get(`${ENDPOINT}/template`, {
    params: { company_id: companyId },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_bonificaciones.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportBonusesResult {
  success: boolean;
  message?: string;
  created: number;
  updated: number;
  rows_processed: number;
  skipped: number;
  errors: string[];
}

export async function importBonuses(
  file: File,
  periodId: string | number,
  typeId: string | number,
): Promise<ImportBonusesResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("period_id", String(periodId));
  formData.append("type_id", String(typeId));
  const { data } = await api.post<ImportBonusesResult>(
    `${ENDPOINT}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
