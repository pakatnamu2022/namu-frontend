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

export async function importInsurance(
  file: File,
  period_id: string | number,
  business_partner_id: string | number,
): Promise<GeneralResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("period_id", String(period_id));
  formData.append("business_partner_id", String(business_partner_id));
  const { data } = await api.post<GeneralResponse>(
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
