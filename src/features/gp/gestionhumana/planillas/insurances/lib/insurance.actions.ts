import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import { InsuranceResource, InsuranceResponse } from "./insurance.interface";
import { INSURANCE } from "./insurance.constant";

const { ENDPOINT } = INSURANCE;

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

export async function storeInsurance(payload: any): Promise<InsuranceResource> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  return unwrap<InsuranceResource>(data);
}

export async function updateInsurance(
  id: number,
  payload: any,
): Promise<InsuranceResource> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}`, payload);
  return unwrap<InsuranceResource>(data);
}

export async function deleteInsurance(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
