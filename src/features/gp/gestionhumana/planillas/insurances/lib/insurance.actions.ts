import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { InsuranceResource, InsuranceResponse } from "./insurance.interface";
import { INSURANCE } from "./insurance.constant";

const { ENDPOINT } = INSURANCE;

export async function getInsurances(
  params?: Record<string, any>,
): Promise<InsuranceResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<InsuranceResponse>(ENDPOINT, config);
  return data;
}

export async function findInsuranceById(id: number): Promise<InsuranceResource> {
  const { data } = await api.get<{ data: InsuranceResource }>(`${ENDPOINT}/${id}`);
  return data.data;
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
