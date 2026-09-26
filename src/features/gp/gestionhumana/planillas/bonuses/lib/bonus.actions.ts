import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  BonusPeriodInput,
  BonusResource,
  BonusResponse,
} from "./bonus.interface";
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
 * GET /bonuses/template?company_id=&periods[]=YYYY-MM
 * Descarga la plantilla Excel matriz (una fila por trabajador activo, una columna por periodo
 * elegido) para completar el monto de cada trabajador en el mes que corresponda — así se pueden
 * cargar varios periodos en un mismo archivo — e importarla luego con importBonuses().
 */
export async function downloadBonusTemplate(
  companyId: string | number,
  periods: BonusPeriodInput[],
): Promise<void> {
  const { data } = await api.get(`${ENDPOINT}/template`, {
    params: {
      company_id: companyId,
      periods: periods.map(
        (p) => `${p.year}-${String(p.month).padStart(2, "0")}`,
      ),
    },
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
  companyId: string | number,
  typeId: string | number,
): Promise<ImportBonusesResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("company_id", String(companyId));
  formData.append("type_id", String(typeId));
  const { data } = await api.post<ImportBonusesResult>(
    `${ENDPOINT}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
