import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { InsuranceResource, InsuranceResponse } from "./insurance.interface";
import { INSURANCE } from "./insurance.constant";

const { ENDPOINT } = INSURANCE;

// El backend a veces envuelve la respuesta en { data: ... } (show/store/update
// usan success($resource), que serializa el Resource SIN el wrapper "data") y
// a veces no — este helper soporta ambos casos sin asumir uno fijo.
function unwrap<T>(response: any): T {
  return response?.data ?? response;
}

export async function getInsurances(
  params?: Record<string, any>,
): Promise<InsuranceResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<InsuranceResponse>(ENDPOINT, config);
  return data;
}

export async function findInsuranceById(id: number): Promise<InsuranceResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<InsuranceResource>(data);
}

export async function deleteInsurance(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export interface InsuranceImportRow {
  fila: number;
  doc_afiliado: string;
  contratante: string;
  doc_contratante: string;
  tarifa: number | string;
  estado: string;
  motivo: string;
}

export interface InsuranceImportSummary {
  company_name: string | null;
  period_name: string | null;
  business_partner_name: string;
  imported_at: string;
  rows_processed: number;
  created: number;
  updated: number;
  not_imported: number;
  global_errors: string[];
}

export interface InsuranceImportResult {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  rows_processed: number;
  errors: string[];
  summary: InsuranceImportSummary;
  report: InsuranceImportRow[];
}

/**
 * Importa el Excel de seguros. El backend valida fila por fila (incluyendo si
 * el DNI pertenece a la empresa del periodo seleccionado) y responde con un
 * JSON: resumen de la importación + detalle fila por fila, para mostrarlo en
 * un GeneralSheet en vez de descargar un archivo.
 */
export async function importInsurance(
  file: File,
  period_id: string | number,
  business_partner_id: string | number,
): Promise<InsuranceImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("period_id", String(period_id));
  formData.append("business_partner_id", String(business_partner_id));

  const { data } = await api.post<InsuranceImportResult>(
    `${ENDPOINT}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

const TEMPLATE_FILE_NAMES: Record<string, string> = {
  "13297": "plantilla_seguro_fesalud.xlsx",
  "13298": "plantilla_seguro_oncosalud.xlsx",
};

export async function downloadInsuranceTemplate(
  business_partner_id: string | number,
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/template`, {
    params: { business_partner_id },
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    TEMPLATE_FILE_NAMES[String(business_partner_id)] ?? "plantilla_seguro.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function createInsurance(
  payload: Record<string, any>,
): Promise<InsuranceResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<InsuranceResource>(data);
}

export async function updateInsurance(
  id: number,
  payload: Record<string, any>,
): Promise<InsuranceResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<InsuranceResource>(data);
}
